import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';

// ── IMPORTANT: disable Next.js body parsing so we get raw bytes ──
export const runtime = 'nodejs';

// Map Stripe subscription status → our subscription_tier enum
function tierFromStripeProduct(
  tierMeta: string | undefined
): 'free' | 'premium' | 'family_pro' {
  if (tierMeta === 'family_pro') return 'family_pro';
  if (tierMeta === 'premium') return 'premium';
  return 'free';
}

async function upsertSubscription(
  admin: ReturnType<typeof createAdminClient>,
  opts: {
    householdId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    tier: 'free' | 'premium' | 'family_pro';
    status: string;
    periodStart?: Date;
    periodEnd?: Date;
    cancelledAt?: Date | null;
  }
) {
  const { householdId, stripeCustomerId, stripeSubscriptionId, tier, status, periodStart, periodEnd, cancelledAt } = opts;

  // Upsert subscriptions row (idempotent on household_id)
  const { error: subErr } = await admin.from('subscriptions').upsert(
    {
      household_id: householdId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      tier,
      status,
      current_period_start: periodStart?.toISOString() ?? null,
      current_period_end: periodEnd?.toISOString() ?? null,
      cancelled_at: cancelledAt?.toISOString() ?? null,
    },
    { onConflict: 'household_id' }
  );
  if (subErr) {
    console.error('[webhook] subscriptions upsert error:', subErr.message);
    throw subErr;
  }

  // Keep households.subscription_tier in sync
  const { error: householdErr } = await admin
    .from('households')
    .update({ subscription_tier: tier })
    .eq('id', householdId);
  if (householdErr) {
    console.error('[webhook] households update error:', householdErr.message);
    throw householdErr;
  }

  console.log(`[webhook] household ${householdId} → tier=${tier} status=${status}`);
}

// ── Webhook handler ──────────────────────────────────────────
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Read raw bytes — required for Stripe signature verification
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  // ── Verify signature ──────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhook] Signature verification failed:', msg);
    return NextResponse.json({ error: `Webhook signature invalid: ${msg}` }, { status: 400 });
  }

  const admin = createAdminClient();

  // ── Route events ──────────────────────────────────────────
  try {
    switch (event.type) {
      // ── checkout.session.completed ─────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const householdId = session.metadata?.household_id;
        const tier = tierFromStripeProduct(session.metadata?.tier);

        if (!householdId) {
          console.error('[webhook] checkout.session.completed: missing household_id in metadata');
          break;
        }

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? '';
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? '';

        // Fetch subscription details for period dates
        let periodStart: Date | undefined;
        let periodEnd: Date | undefined;
        if (subscriptionId) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
            periodStart = new Date(stripeSub.current_period_start * 1000);
            periodEnd = new Date(stripeSub.current_period_end * 1000);
          } catch {
            // Non-fatal — we can backfill on the next invoice event
          }
        }

        await upsertSubscription(admin, {
          householdId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          tier,
          status: 'active',
          periodStart,
          periodEnd,
          cancelledAt: null,
        });
        break;
      }

      // ── invoice.payment_succeeded ──────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? '';

        // Find household by customer ID
        const { data: sub } = await admin
          .from('subscriptions')
          .select('household_id, tier')
          .eq('stripe_customer_id', customerId)
          .limit(1)
          .single();

        if (!sub) break;

        const subscriptionId =
          typeof invoice.subscription === 'string'
            ? invoice.subscription
            : invoice.subscription?.id ?? '';

        let periodStart: Date | undefined;
        let periodEnd: Date | undefined;
        if (subscriptionId) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
            periodStart = new Date(stripeSub.current_period_start * 1000);
            periodEnd = new Date(stripeSub.current_period_end * 1000);
          } catch { /* non-fatal */ }
        }

        await upsertSubscription(admin, {
          householdId: sub.household_id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          tier: sub.tier,
          status: 'active',
          periodStart,
          periodEnd,
          cancelledAt: null,
        });
        break;
      }

      // ── customer.subscription.updated ─────────────────────
      case 'customer.subscription.updated': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer?.id ?? '';

        const { data: sub } = await admin
          .from('subscriptions')
          .select('household_id')
          .eq('stripe_customer_id', customerId)
          .limit(1)
          .single();

        if (!sub) break;

        const tier = tierFromStripeProduct(stripeSub.metadata?.tier);
        const status = stripeSub.status;
        const periodStart = new Date(stripeSub.current_period_start * 1000);
        const periodEnd = new Date(stripeSub.current_period_end * 1000);
        const cancelledAt = stripeSub.canceled_at
          ? new Date(stripeSub.canceled_at * 1000)
          : null;

        await upsertSubscription(admin, {
          householdId: sub.household_id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSub.id,
          tier,
          status,
          periodStart,
          periodEnd,
          cancelledAt,
        });
        break;
      }

      // ── customer.subscription.deleted ─────────────────────
      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof stripeSub.customer === 'string'
            ? stripeSub.customer
            : stripeSub.customer?.id ?? '';

        const { data: sub } = await admin
          .from('subscriptions')
          .select('household_id')
          .eq('stripe_customer_id', customerId)
          .limit(1)
          .single();

        if (!sub) break;

        await upsertSubscription(admin, {
          householdId: sub.household_id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: stripeSub.id,
          tier: 'free',
          status: 'cancelled',
          cancelledAt: new Date(),
        });
        break;
      }

      default:
        // Acknowledge but don't process unhandled events
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[webhook] Handler error:', msg);
    // Return 200 to prevent Stripe retrying an unrecoverable error.
    // Log the issue and investigate separately.
    return NextResponse.json({ received: true, error: msg }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
