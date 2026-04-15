-- ============================================================
-- PAR-KIDS — Security Hardening + Membership Roles + Strict RLS
-- Migration: 014_security_hardening_memberships_rls
-- ============================================================

-- 1) Memberships as source of truth for per-household role
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, household_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_household_id ON public.memberships(household_id);

-- Backfill memberships from existing household_members rows.
INSERT INTO public.memberships (user_id, household_id, role)
SELECT hm.user_id, hm.household_id, CASE WHEN hm.role::TEXT = 'child' THEN 'child' ELSE 'parent' END
FROM public.household_members hm
ON CONFLICT (user_id, household_id) DO NOTHING;

-- Backfill memberships from auth-backed profiles for users that have household_id.
INSERT INTO public.memberships (user_id, household_id, role)
SELECT p.auth_user_id, p.household_id, 'parent'
FROM public.profiles p
WHERE p.household_id IS NOT NULL
ON CONFLICT (user_id, household_id) DO NOTHING;

-- 2) Remove role from profiles (role now lives in memberships)
-- Drop policies/functions that may depend on profiles.role before removing column.
DROP POLICY IF EXISTS "household_invites_insert_parent_household" ON public.household_invites;

CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.role = 'parent'
  );
$$;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- 3) Invite hardening (single-use + optional audit)
ALTER TABLE public.household_invites
  ADD COLUMN IF NOT EXISTS used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS used_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.household_invites
  DROP CONSTRAINT IF EXISTS household_invites_usage_consistency_check;

ALTER TABLE public.household_invites
  ADD CONSTRAINT household_invites_usage_consistency_check
  CHECK (
    (used_at IS NULL AND used_by IS NULL)
    OR (used_at IS NOT NULL AND used_by IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_household_invites_unused
  ON public.household_invites(code)
  WHERE used_at IS NULL;

-- 4) Helper functions
CREATE OR REPLACE FUNCTION public.current_user_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT p.id
  FROM public.profiles p
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_household_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
AS $$
  SELECT m.household_id
  FROM public.memberships m
  WHERE m.user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_household_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT m.household_id
  FROM public.memberships m
  WHERE m.user_id = auth.uid()
  ORDER BY m.created_at ASC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role(h_id UUID DEFAULT public.current_household_id())
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT m.role
  FROM public.memberships m
  WHERE m.user_id = auth.uid()
    AND m.household_id = h_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_parent(h_id UUID DEFAULT public.current_household_id())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.household_id = h_id
      AND m.role = 'parent'
  );
$$;

-- Backward-compatible aliases used in older migrations/app code
CREATE OR REPLACE FUNCTION public.current_household()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_household_id();
$$;

CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT public.is_parent(public.current_household_id());
$$;

-- 5) Voting integrity constraints + veto lock triggers
ALTER TABLE public.poll_votes
  DROP CONSTRAINT IF EXISTS poll_votes_poll_id_user_id_key;

ALTER TABLE public.poll_votes
  ADD CONSTRAINT poll_votes_poll_id_user_id_key UNIQUE (poll_id, user_id);

CREATE OR REPLACE FUNCTION public.block_poll_votes_when_finalized()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  poll_record RECORD;
BEGIN
  SELECT p.id, p.household_id, p.status
  INTO poll_record
  FROM public.family_polls p
  WHERE p.id = NEW.poll_id
  LIMIT 1;

  IF poll_record.id IS NULL THEN
    RAISE EXCEPTION 'Poll not found';
  END IF;

  IF poll_record.household_id NOT IN (SELECT public.current_household_ids()) THEN
    RAISE EXCEPTION 'Cross-household voting is not allowed';
  END IF;

  IF poll_record.status <> 'active' THEN
    RAISE EXCEPTION 'Decision finalized by parent';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.poll_votes pv
    WHERE pv.poll_id = NEW.poll_id
      AND pv.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User has already voted';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_block_votes_when_poll_finalized ON public.poll_votes;
CREATE TRIGGER trigger_block_votes_when_poll_finalized
  BEFORE INSERT ON public.poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.block_poll_votes_when_finalized();

CREATE OR REPLACE FUNCTION public.block_updates_after_veto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'vetoed' AND (
    NEW.status IS DISTINCT FROM OLD.status
    OR NEW.title IS DISTINCT FROM OLD.title
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.final_option_id IS DISTINCT FROM OLD.final_option_id
    OR NEW.vetoed_by IS DISTINCT FROM OLD.vetoed_by
    OR NEW.veto_reason IS DISTINCT FROM OLD.veto_reason
    OR NEW.ends_at IS DISTINCT FROM OLD.ends_at
    OR NEW.winning_option_id IS DISTINCT FROM OLD.winning_option_id
  ) THEN
    RAISE EXCEPTION 'Vetoed polls are immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_block_updates_after_veto ON public.family_polls;
CREATE TRIGGER trigger_block_updates_after_veto
  BEFORE UPDATE ON public.family_polls
  FOR EACH ROW
  EXECUTE FUNCTION public.block_updates_after_veto();

-- 6) RLS enablement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- 7) Profiles policies
DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_same_household_read ON public.profiles;
DROP POLICY IF EXISTS profiles_self_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;

CREATE POLICY profiles_same_household_read
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = auth_user_id
    OR EXISTS (
      SELECT 1
      FROM public.memberships mt
      WHERE mt.user_id = profiles.auth_user_id
        AND mt.household_id IN (SELECT public.current_household_ids())
    )
  );

CREATE POLICY profiles_self_insert
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY profiles_self_update
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

-- 8) Membership policies
DROP POLICY IF EXISTS memberships_select_household ON public.memberships;
DROP POLICY IF EXISTS memberships_insert_parent_or_self ON public.memberships;
DROP POLICY IF EXISTS memberships_update_parent_only ON public.memberships;
DROP POLICY IF EXISTS memberships_delete_parent_only ON public.memberships;

CREATE POLICY memberships_select_household
  ON public.memberships
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR household_id IN (SELECT public.current_household_ids())
  );

CREATE POLICY memberships_insert_parent_or_self
  ON public.memberships
  FOR INSERT
  WITH CHECK (
    role IN ('parent', 'child')
    AND (
      user_id = auth.uid()
      OR public.is_parent(household_id)
    )
  );

CREATE POLICY memberships_update_parent_only
  ON public.memberships
  FOR UPDATE
  USING (public.is_parent(household_id))
  WITH CHECK (
    public.is_parent(household_id)
    AND role IN ('parent', 'child')
  );

CREATE POLICY memberships_delete_parent_only
  ON public.memberships
  FOR DELETE
  USING (public.is_parent(household_id));

-- 9) Households policies
DROP POLICY IF EXISTS households_select_member_only ON public.households;
DROP POLICY IF EXISTS households_insert_authenticated ON public.households;

CREATE POLICY households_select_member_only
  ON public.households
  FOR SELECT
  USING (id IN (SELECT public.current_household_ids()));

CREATE POLICY households_insert_authenticated
  ON public.households
  FOR INSERT
  TO authenticated
  WITH CHECK (primary_user_id = auth.uid());

-- 10) Invites policies (single-use + parent-only write)
DROP POLICY IF EXISTS household_invites_select_own_household ON public.household_invites;
DROP POLICY IF EXISTS household_invites_insert_parent_household ON public.household_invites;
DROP POLICY IF EXISTS household_invites_update_parent_household ON public.household_invites;

CREATE POLICY household_invites_select_own_household
  ON public.household_invites
  FOR SELECT
  USING (
    household_id IN (SELECT public.current_household_ids())
  );

CREATE POLICY household_invites_insert_parent_household
  ON public.household_invites
  FOR INSERT
  WITH CHECK (
    public.is_parent(household_id)
    AND role IN ('parent', 'child')
    AND expires_at > NOW()
  );

CREATE POLICY household_invites_update_parent_household
  ON public.household_invites
  FOR UPDATE
  USING (
    public.is_parent(household_id)
    OR used_by = auth.uid()
  )
  WITH CHECK (
    household_id IN (SELECT public.current_household_ids())
    AND role IN ('parent', 'child')
    AND (
      used_at IS NULL
      OR used_by = auth.uid()
      OR public.is_parent(household_id)
    )
  );

-- 11) Polls + options + votes policies
DROP POLICY IF EXISTS polls_household_access ON public.family_polls;
DROP POLICY IF EXISTS polls_household_create ON public.family_polls;
DROP POLICY IF EXISTS polls_parent_veto_update ON public.family_polls;

CREATE POLICY polls_household_access
  ON public.family_polls
  FOR SELECT
  USING (
    household_id IN (SELECT public.current_household_ids())
  );

CREATE POLICY polls_household_create
  ON public.family_polls
  FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.current_household_ids())
    AND created_by = auth.uid()
    AND public.is_parent(household_id)
  );

CREATE POLICY polls_parent_veto_update
  ON public.family_polls
  FOR UPDATE
  USING (
    household_id IN (SELECT public.current_household_ids())
    AND public.is_parent(household_id)
    AND status <> 'vetoed'
  )
  WITH CHECK (
    household_id IN (SELECT public.current_household_ids())
    AND public.is_parent(household_id)
    AND status IN ('active', 'closed', 'vetoed')
  );

DROP POLICY IF EXISTS poll_options_household_access ON public.poll_options;
DROP POLICY IF EXISTS poll_options_household_create ON public.poll_options;

CREATE POLICY poll_options_household_access
  ON public.poll_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_options.poll_id
        AND p.household_id IN (SELECT public.current_household_ids())
    )
  );

CREATE POLICY poll_options_household_create
  ON public.poll_options
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_options.poll_id
        AND p.household_id IN (SELECT public.current_household_ids())
        AND public.is_parent(p.household_id)
    )
  );

DROP POLICY IF EXISTS poll_votes_household_access ON public.poll_votes;
DROP POLICY IF EXISTS poll_votes_one_per_user ON public.poll_votes;
DROP POLICY IF EXISTS poll_votes_update_own ON public.poll_votes;

CREATE POLICY poll_votes_household_access
  ON public.poll_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_votes.poll_id
        AND p.household_id IN (SELECT public.current_household_ids())
    )
  );

CREATE POLICY poll_votes_one_per_user
  ON public.poll_votes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_votes.poll_id
        AND p.household_id IN (SELECT public.current_household_ids())
        AND p.status = 'active'
        AND p.ends_at > NOW()
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.poll_votes pv
      WHERE pv.poll_id = poll_votes.poll_id
        AND pv.user_id = auth.uid()
    )
  );

-- 12) Points policies (backend-only insert)
DROP POLICY IF EXISTS points_household_read ON public.points;
DROP POLICY IF EXISTS points_parent_insert ON public.points;
DROP POLICY IF EXISTS points_same_household_read ON public.points;
DROP POLICY IF EXISTS points_no_direct_insert ON public.points;

CREATE POLICY points_same_household_read
  ON public.points
  FOR SELECT
  USING (
    household_id IN (SELECT public.current_household_ids())
  );

CREATE POLICY points_no_direct_insert
  ON public.points
  FOR INSERT
  WITH CHECK (FALSE);

-- 13) Rewards policies
DROP POLICY IF EXISTS rewards_household_access ON public.rewards;
DROP POLICY IF EXISTS rewards_parent_insert ON public.rewards;

CREATE POLICY rewards_household_access
  ON public.rewards
  FOR SELECT
  USING (
    household_id IN (SELECT public.current_household_ids())
  );

CREATE POLICY rewards_parent_insert
  ON public.rewards
  FOR INSERT
  WITH CHECK (
    household_id IN (SELECT public.current_household_ids())
    AND public.is_parent(household_id)
    AND created_by = auth.uid()
  );
