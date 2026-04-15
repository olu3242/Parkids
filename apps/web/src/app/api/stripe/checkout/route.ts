import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe, PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  // ── 1. Auth guard ──────────────────────────────────────────
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 2. Parse body ──────────────────────────────────────────
  let tier: keyof typeof PLANS;
  try {
    const body = await req.json();
    tier = body.tier as keyof typeof PLANS;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const plan = PLANS[tier];
  if (!plan) {
    return NextResponse.json({ error: `Unknown plan: ${tier}` }, { status: 400 });
  }
  if (!plan.priceId) {
    return NextResponse.json(
      { error: `Price ID not configured for plan: ${tier}. Set STRIPE_PRICE_ID_${tier.toUpperCase()} in env.` },
      { status: 500 }
    );
  }

  // ── 3. Look up household ───────────────────────────────────
  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!membership?.household_id) {
    return NextResponse.json(
      { error: 'No household found. Complete onboarding first.' },
      { status: 400 }
    );
  }

  const householdId = membership.household_id;

  // ── 4. Re-use Stripe customer if one already exists ────────
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('household_id', householdId)
    .limit(1)
    .single();

  let customerId = existingSub?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id, household_id: householdId },
    });
    customerId = customer.id;
  }

  // ── 5. Create Checkout Session ─────────────────────────────
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    metadata: {
      user_id: user.id,
      household_id: householdId,
      tier,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        household_id: householdId,
        tier,
      },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
