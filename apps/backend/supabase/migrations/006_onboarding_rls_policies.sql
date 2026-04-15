-- ============================================================
-- PAR-KIDS — Onboarding RLS Policies
-- Migration: 006_onboarding_rls_policies
-- Adds missing RLS policies for households, household_members,
-- parent_profiles, child_profiles, and parent_child_relationships
-- so the onboarding flow can write data via service role + the
-- rest of the app can read through anon/user role.
-- ============================================================

-- ── households ───────────────────────────────────────────────
DROP POLICY IF EXISTS "households_owner_all" ON public.households;
CREATE POLICY "households_owner_all" ON public.households
  FOR ALL USING (primary_user_id = auth.uid());

DROP POLICY IF EXISTS "households_member_select" ON public.households;
CREATE POLICY "households_member_select" ON public.households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = public.households.id
        AND hm.user_id = auth.uid()
        AND hm.is_active = TRUE
    )
  );

-- ── household_members ─────────────────────────────────────────
DROP POLICY IF EXISTS "household_members_own_select" ON public.household_members;
CREATE POLICY "household_members_own_select" ON public.household_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.household_members hm2
      WHERE hm2.household_id = public.household_members.household_id
        AND hm2.user_id = auth.uid()
        AND hm2.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "household_members_parent_insert" ON public.household_members;
CREATE POLICY "household_members_parent_insert" ON public.household_members
  FOR INSERT WITH CHECK (
    -- allow inserting own record
    user_id = auth.uid()
    OR
    -- allow parent to insert children into their household
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = public.household_members.household_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('parent', 'co_parent', 'caregiver', 'admin')
        AND hm.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "household_members_parent_update" ON public.household_members;
CREATE POLICY "household_members_parent_update" ON public.household_members
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = public.household_members.household_id
        AND hm.user_id = auth.uid()
        AND hm.role IN ('parent', 'co_parent', 'caregiver', 'admin')
        AND hm.is_active = TRUE
    )
  );

-- ── parent_profiles ───────────────────────────────────────────
DROP POLICY IF EXISTS "parent_profiles_own" ON public.parent_profiles;
CREATE POLICY "parent_profiles_own" ON public.parent_profiles
  FOR ALL USING (user_id = auth.uid());

-- ── child_profiles ────────────────────────────────────────────
DROP POLICY IF EXISTS "child_profiles_own" ON public.child_profiles;
CREATE POLICY "child_profiles_own" ON public.child_profiles
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "child_profiles_parent_access" ON public.child_profiles;
CREATE POLICY "child_profiles_parent_access" ON public.child_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = public.child_profiles.user_id
    )
  );

-- ── parent_child_relationships ────────────────────────────────
DROP POLICY IF EXISTS "pcr_parent_all" ON public.parent_child_relationships;
CREATE POLICY "pcr_parent_all" ON public.parent_child_relationships
  FOR ALL USING (
    parent_user_id = auth.uid()
    OR child_user_id = auth.uid()
  );
