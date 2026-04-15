-- ============================================================
-- PAR-KIDS — Stripe / Subscription RLS & Indexes
-- Migration: 007_subscriptions_stripe_rls
-- Adds RLS policies for subscriptions + indexes on Stripe IDs
-- ============================================================

-- ── subscriptions: RLS ───────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Household members can read the subscription for their household
DROP POLICY IF EXISTS "subscriptions_household_select" ON public.subscriptions;
CREATE POLICY "subscriptions_household_select" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = public.subscriptions.household_id
        AND hm.user_id = auth.uid()
        AND hm.is_active = TRUE
    )
  );

-- Only the primary household owner (parent) can insert/update
DROP POLICY IF EXISTS "subscriptions_owner_write" ON public.subscriptions;
CREATE POLICY "subscriptions_owner_write" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.households h
      WHERE h.id = public.subscriptions.household_id
        AND h.primary_user_id = auth.uid()
    )
  );

-- Performance indexes on Stripe IDs for webhook lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription
  ON public.subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
