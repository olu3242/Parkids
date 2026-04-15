import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  // ── Auth guard ─────────────────────────────────────────────
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Lookup household + Stripe customer ─────────────────────
  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single();

  if (!membership?.household_id) {
    return NextResponse.json({ error: 'No household found.' }, { status: 400 });
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('household_id', membership.household_id)
    .limit(1)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No Stripe customer found. Purchase a plan first.' },
      { status: 404 }
    );
  }

  // ── Create billing portal session ─────────────────────────
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/dashboard/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
