-- ============================================================
-- PAR-KIDS — Waitlist + Validation Surveys
-- Migration: 016_waitlist_and_surveys
-- ============================================================

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  children_count INTEGER NOT NULL DEFAULT 0 CHECK (children_count >= 0 AND children_count <= 20),
  biggest_challenge TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_unique_idx
  ON public.waitlist (LOWER(email));

CREATE INDEX IF NOT EXISTS idx_waitlist_created_at
  ON public.waitlist (created_at DESC);

CREATE TABLE IF NOT EXISTS public.parent_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id UUID REFERENCES public.waitlist(id) ON DELETE SET NULL,
  email TEXT,
  frequency_of_conversations TEXT NOT NULL,
  biggest_challenges TEXT NOT NULL,
  emotional_openness INTEGER NOT NULL CHECK (emotional_openness BETWEEN 1 AND 5),
  willingness_to_use_tool INTEGER NOT NULL CHECK (willingness_to_use_tool BETWEEN 1 AND 5),
  willingness_to_pay TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_surveys_waitlist_id
  ON public.parent_surveys (waitlist_id);

CREATE INDEX IF NOT EXISTS idx_parent_surveys_created_at
  ON public.parent_surveys (created_at DESC);

CREATE TABLE IF NOT EXISTS public.child_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_id UUID REFERENCES public.waitlist(id) ON DELETE SET NULL,
  communication_comfort INTEGER NOT NULL CHECK (communication_comfort BETWEEN 1 AND 5),
  motivation_preferences TEXT NOT NULL,
  rewards_interest INTEGER NOT NULL CHECK (rewards_interest BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_surveys_waitlist_id
  ON public.child_surveys (waitlist_id);

CREATE INDEX IF NOT EXISTS idx_child_surveys_created_at
  ON public.child_surveys (created_at DESC);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS waitlist_no_direct_access ON public.waitlist;
CREATE POLICY waitlist_no_direct_access
  ON public.waitlist
  FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS parent_surveys_no_direct_access ON public.parent_surveys;
CREATE POLICY parent_surveys_no_direct_access
  ON public.parent_surveys
  FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS child_surveys_no_direct_access ON public.child_surveys;
CREATE POLICY child_surveys_no_direct_access
  ON public.child_surveys
  FOR ALL
  USING (FALSE)
  WITH CHECK (FALSE);
