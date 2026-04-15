-- ============================================================
-- PAR-KIDS — Parent Veto Actions Enforcement
-- Migration: 005_parent_veto_actions
-- ============================================================

ALTER TABLE public.family_polls
  ADD COLUMN IF NOT EXISTS veto_reason TEXT;

CREATE TABLE IF NOT EXISTS public.veto_actions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id          UUID NOT NULL REFERENCES public.family_polls(id) ON DELETE CASCADE,
  household_id     UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  parent_id        UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  final_option_id  UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  reason           TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (poll_id)
);

CREATE INDEX IF NOT EXISTS idx_veto_actions_household ON public.veto_actions(household_id);
CREATE INDEX IF NOT EXISTS idx_veto_actions_parent ON public.veto_actions(parent_id);

CREATE OR REPLACE FUNCTION public.apply_veto_action_to_poll()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.family_polls
  SET status = 'vetoed',
      final_option_id = NEW.final_option_id,
      vetoed_by = NEW.parent_id,
      veto_reason = NEW.reason,
      updated_at = NOW()
  WHERE id = NEW.poll_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_apply_veto_action_to_poll ON public.veto_actions;
CREATE TRIGGER trigger_apply_veto_action_to_poll
  AFTER INSERT ON public.veto_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_veto_action_to_poll();

ALTER TABLE public.veto_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS veto_actions_household_read ON public.veto_actions;
CREATE POLICY veto_actions_household_read ON public.veto_actions
  FOR SELECT
  USING (public.is_user_in_household(household_id));

DROP POLICY IF EXISTS veto_actions_parent_insert ON public.veto_actions;
CREATE POLICY veto_actions_parent_insert ON public.veto_actions
  FOR INSERT
  WITH CHECK (
    parent_id = auth.uid()
    AND public.is_parent_user(auth.uid())
    AND public.is_user_in_household(household_id)
    AND EXISTS (
      SELECT 1
      FROM public.family_polls p
      WHERE p.id = veto_actions.poll_id
        AND p.household_id = veto_actions.household_id
        AND p.status IN ('closed', 'vetoed')
    )
    AND EXISTS (
      SELECT 1
      FROM public.poll_options po
      WHERE po.id = veto_actions.final_option_id
        AND po.poll_id = veto_actions.poll_id
    )
  );
