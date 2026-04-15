-- ============================================================
-- PAR-KIDS — Poll Update Policy Hardening
-- Migration: 004_poll_update_policy_hardening
-- ============================================================

DROP POLICY IF EXISTS polls_parent_veto_update ON public.family_polls;
CREATE POLICY polls_parent_veto_update ON public.family_polls
  FOR UPDATE
  USING (
    public.is_user_in_household(household_id)
    AND public.is_parent_user(auth.uid())
  )
  WITH CHECK (
    public.is_user_in_household(household_id)
    AND public.is_parent_user(auth.uid())
  );
