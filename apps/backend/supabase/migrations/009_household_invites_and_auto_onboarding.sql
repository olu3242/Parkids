CREATE TABLE IF NOT EXISTS public.household_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  role public.profile_role NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_household_invites_code
  ON public.household_invites(code);

CREATE INDEX IF NOT EXISTS idx_household_invites_household_id
  ON public.household_invites(household_id);

ALTER TABLE public.household_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "household_invites_select_own_household" ON public.household_invites;
CREATE POLICY "household_invites_select_own_household"
  ON public.household_invites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.household_id = household_invites.household_id
    )
  );

DROP POLICY IF EXISTS "household_invites_insert_parent_household" ON public.household_invites;
CREATE POLICY "household_invites_insert_parent_household"
  ON public.household_invites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.auth_user_id = auth.uid()
        AND profiles.household_id = household_invites.household_id
        AND profiles.role = 'parent'
    )
  );
