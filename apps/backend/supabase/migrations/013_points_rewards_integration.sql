CREATE TABLE IF NOT EXISTS public.points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awarded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  poll_id UUID REFERENCES public.family_polls(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_household ON public.points(household_id);
CREATE INDEX IF NOT EXISTS idx_points_child_user ON public.points(child_user_id);

ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS points_household_read ON public.points;
CREATE POLICY points_household_read ON public.points
  FOR SELECT
  USING (household_id = public.current_household());

DROP POLICY IF EXISTS points_parent_insert ON public.points;
CREATE POLICY points_parent_insert ON public.points
  FOR INSERT
  WITH CHECK (
    household_id = public.current_household()
    AND public.is_parent()
    AND awarded_by = auth.uid()
  );
