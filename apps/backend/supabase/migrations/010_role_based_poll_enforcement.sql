ALTER TABLE public.profiles
  ALTER COLUMN role SET DEFAULT 'parent';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('parent', 'child'));

CREATE OR REPLACE FUNCTION public.current_household()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT household_id
  FROM public.profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE auth_user_id = auth.uid()
      AND role = 'parent'
  );
$$;

CREATE OR REPLACE FUNCTION public.block_votes_when_poll_finalized()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  poll_status public.poll_status;
  poll_household UUID;
BEGIN
  SELECT status, household_id
  INTO poll_status, poll_household
  FROM public.family_polls
  WHERE id = NEW.poll_id;

  IF poll_status IS NULL THEN
    RAISE EXCEPTION 'Poll not found';
  END IF;

  IF poll_household IS DISTINCT FROM public.current_household() THEN
    RAISE EXCEPTION 'Cross-household voting is not allowed';
  END IF;

  IF poll_status = 'vetoed' THEN
    RAISE EXCEPTION 'Decision finalized by parent';
  END IF;

  IF poll_status <> 'active' THEN
    RAISE EXCEPTION 'Poll is no longer accepting votes';
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
  EXECUTE FUNCTION public.block_votes_when_poll_finalized();

DROP POLICY IF EXISTS polls_household_access ON public.family_polls;
CREATE POLICY polls_household_access ON public.family_polls
  FOR SELECT
  USING (household_id = public.current_household());

DROP POLICY IF EXISTS polls_household_create ON public.family_polls;
CREATE POLICY polls_household_create ON public.family_polls
  FOR INSERT
  WITH CHECK (
    household_id = public.current_household()
    AND created_by = auth.uid()
    AND public.is_parent()
  );

DROP POLICY IF EXISTS polls_parent_veto_update ON public.family_polls;
CREATE POLICY polls_parent_veto_update ON public.family_polls
  FOR UPDATE
  USING (
    household_id = public.current_household()
    AND public.is_parent()
  )
  WITH CHECK (
    household_id = public.current_household()
    AND public.is_parent()
  );

DROP POLICY IF EXISTS poll_options_household_access ON public.poll_options;
CREATE POLICY poll_options_household_access ON public.poll_options
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_options.poll_id
        AND p.household_id = public.current_household()
    )
  );

DROP POLICY IF EXISTS poll_options_household_create ON public.poll_options;
CREATE POLICY poll_options_household_create ON public.poll_options
  FOR INSERT
  WITH CHECK (
    public.is_parent()
    AND EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_options.poll_id
        AND p.household_id = public.current_household()
    )
  );

DROP POLICY IF EXISTS poll_votes_household_access ON public.poll_votes;
CREATE POLICY poll_votes_household_access ON public.poll_votes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_votes.poll_id
        AND p.household_id = public.current_household()
    )
  );

DROP POLICY IF EXISTS poll_votes_one_per_user ON public.poll_votes;
CREATE POLICY poll_votes_one_per_user ON public.poll_votes
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = poll_votes.poll_id
        AND p.household_id = public.current_household()
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

DROP POLICY IF EXISTS poll_votes_update_own ON public.poll_votes;

DROP POLICY IF EXISTS veto_actions_household_read ON public.veto_actions;
CREATE POLICY veto_actions_household_read ON public.veto_actions
  FOR SELECT
  USING (household_id = public.current_household());

DROP POLICY IF EXISTS veto_actions_parent_insert ON public.veto_actions;
CREATE POLICY veto_actions_parent_insert ON public.veto_actions
  FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND public.is_parent()
    AND household_id = public.current_household()
    AND EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = veto_actions.poll_id
        AND p.household_id = public.current_household()
        AND p.status <> 'vetoed'
    )
    AND EXISTS (
      SELECT 1
      FROM public.poll_options po
      WHERE po.id = veto_actions.final_option_id
        AND po.poll_id = veto_actions.poll_id
    )
  );
