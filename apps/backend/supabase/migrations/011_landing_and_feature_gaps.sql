DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'note_visibility'
  ) THEN
    CREATE TYPE public.note_visibility AS ENUM ('private', 'shared');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.household_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  body TEXT NOT NULL,
  visibility public.note_visibility NOT NULL DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_household_notes_household ON public.household_notes(household_id);
CREATE INDEX IF NOT EXISTS idx_household_notes_author ON public.household_notes(author_user_id);

DROP TRIGGER IF EXISTS update_household_notes_updated_at ON public.household_notes;
CREATE TRIGGER update_household_notes_updated_at
  BEFORE UPDATE ON public.household_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.household_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS household_notes_read_policy ON public.household_notes;
CREATE POLICY household_notes_read_policy ON public.household_notes
  FOR SELECT
  USING (
    household_id = public.current_household()
    AND (
      visibility = 'shared'
      OR author_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS household_notes_insert_policy ON public.household_notes;
CREATE POLICY household_notes_insert_policy ON public.household_notes
  FOR INSERT
  WITH CHECK (
    household_id = public.current_household()
    AND author_user_id = auth.uid()
  );

DROP POLICY IF EXISTS household_notes_update_policy ON public.household_notes;
CREATE POLICY household_notes_update_policy ON public.household_notes
  FOR UPDATE
  USING (household_id = public.current_household() AND author_user_id = auth.uid())
  WITH CHECK (household_id = public.current_household() AND author_user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.family_gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  child_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  icon TEXT NOT NULL DEFAULT '✨',
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_gallery_items_household ON public.family_gallery_items(household_id);

ALTER TABLE public.family_gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS family_gallery_items_read_policy ON public.family_gallery_items;
CREATE POLICY family_gallery_items_read_policy ON public.family_gallery_items
  FOR SELECT
  USING (household_id = public.current_household());

DROP POLICY IF EXISTS family_gallery_items_insert_policy ON public.family_gallery_items;
CREATE POLICY family_gallery_items_insert_policy ON public.family_gallery_items
  FOR INSERT
  WITH CHECK (
    household_id = public.current_household()
    AND public.is_parent()
  );

CREATE TABLE IF NOT EXISTS public.household_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  event_type TEXT NOT NULL DEFAULT 'checkin',
  child_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_household_events_household ON public.household_events(household_id);
CREATE INDEX IF NOT EXISTS idx_household_events_starts_at ON public.household_events(starts_at);

DROP TRIGGER IF EXISTS update_household_events_updated_at ON public.household_events;
CREATE TRIGGER update_household_events_updated_at
  BEFORE UPDATE ON public.household_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.household_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS household_events_read_policy ON public.household_events;
CREATE POLICY household_events_read_policy ON public.household_events
  FOR SELECT
  USING (household_id = public.current_household());

DROP POLICY IF EXISTS household_events_insert_policy ON public.household_events;
CREATE POLICY household_events_insert_policy ON public.household_events
  FOR INSERT
  WITH CHECK (
    household_id = public.current_household()
    AND public.is_parent()
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS household_events_update_policy ON public.household_events;
CREATE POLICY household_events_update_policy ON public.household_events
  FOR UPDATE
  USING (
    household_id = public.current_household()
    AND public.is_parent()
  )
  WITH CHECK (
    household_id = public.current_household()
    AND public.is_parent()
  );

CREATE TABLE IF NOT EXISTS public.landing_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_completion_pct INTEGER NOT NULL DEFAULT 87,
  goals_completed_count INTEGER NOT NULL DEFAULT 12,
  mood_trend_label TEXT NOT NULL DEFAULT 'Stable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id)
);

CREATE TABLE IF NOT EXISTS public.landing_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_monthly_cents INTEGER NOT NULL DEFAULT 0,
  period_label TEXT NOT NULL,
  description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  feature_list TEXT[] NOT NULL DEFAULT '{}',
  limit_note TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Get Started',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.landing_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.landing_use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.landing_gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL DEFAULT '✨',
  title TEXT NOT NULL,
  subtitle TEXT,
  color_token TEXT NOT NULL DEFAULT 'sage',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.landing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS landing_metrics_public_read ON public.landing_metrics;
CREATE POLICY landing_metrics_public_read ON public.landing_metrics
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS landing_pricing_public_read ON public.landing_pricing_plans;
CREATE POLICY landing_pricing_public_read ON public.landing_pricing_plans
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS landing_faq_public_read ON public.landing_faqs;
CREATE POLICY landing_faq_public_read ON public.landing_faqs
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS landing_use_cases_public_read ON public.landing_use_cases;
CREATE POLICY landing_use_cases_public_read ON public.landing_use_cases
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS landing_gallery_public_read ON public.landing_gallery_items;
CREATE POLICY landing_gallery_public_read ON public.landing_gallery_items
  FOR SELECT USING (TRUE);

INSERT INTO public.landing_metrics (id, checkin_completion_pct, goals_completed_count, mood_trend_label)
VALUES ('00000000-0000-0000-0000-000000000001', 87, 12, 'Stable')
ON CONFLICT (id) DO UPDATE
SET
  checkin_completion_pct = EXCLUDED.checkin_completion_pct,
  goals_completed_count = EXCLUDED.goals_completed_count,
  mood_trend_label = EXCLUDED.mood_trend_label;

INSERT INTO public.landing_pricing_plans
  (slug, name, price_monthly_cents, period_label, description, is_featured, feature_list, limit_note, cta_label, sort_order)
VALUES
  (
    'free',
    'Free',
    0,
    'forever',
    'Start free with core family growth tools.',
    FALSE,
    ARRAY[
      'Up to 2 check-ins per month',
      'Basic mood logging (child only)',
      'Goal tracking — up to 3 goals',
      'Voting system (1 active poll)',
      '1 child profile'
    ],
    'No access to co-parent, calendar, notes, gallery, monthly reports',
    'Get Started Free',
    1
  ),
  (
    'premium',
    'Premium',
    900,
    'per household',
    'Unlimited core features for growing families.',
    TRUE,
    ARRAY[
      'Unlimited check-ins',
      'Full mood and wellness tracking',
      'Unlimited goals',
      'Full voting + veto',
      'Explorer and celebrations',
      'Insights dashboard + monthly reports',
      'Calendar and notes'
    ],
    NULL,
    'Start Premium',
    2
  ),
  (
    'multi-family',
    'Multi-Family',
    1900,
    'per household group',
    'Best for co-parenting across two homes.',
    FALSE,
    ARRAY[
      'Everything in Premium',
      'Advanced co-parent permissions',
      'Linked households',
      'Up to 6 child profiles',
      'Priority support'
    ],
    'Best for co-parenting across two homes',
    'Start Multi-Family',
    3
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  period_label = EXCLUDED.period_label,
  description = EXCLUDED.description,
  is_featured = EXCLUDED.is_featured,
  feature_list = EXCLUDED.feature_list,
  limit_note = EXCLUDED.limit_note,
  cta_label = EXCLUDED.cta_label,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.landing_faqs (question, answer, sort_order)
VALUES
  ('What is a check-in and how does it work?', 'A check-in is a structured parent-child session covering mood, school, social, confidence, habits, challenges, wins, and goals.', 1),
  ('Can two parents from separate homes use the platform?', 'Yes. The Multi-Family plan includes shared household access and permission-based visibility.', 2),
  ('What does the Parent Veto do?', 'Parent Veto lets parents override a poll result with visible reasoning and lock the final decision.', 3),
  ('Do children have full access to the platform?', 'No. Children get a simplified role-based experience focused on participation and progress.', 4),
  ('What are rolling goals?', 'Rolling goals carry forward automatically between check-in periods until completed.', 5),
  ('When does the low mood alert trigger?', 'Alerts trigger when repeated low-mood patterns are detected across sessions.', 6),
  ('Is the Free tier limited permanently?', 'Yes. Free stays available with defined limits and optional paid upgrades.', 7)
ON CONFLICT DO NOTHING;

INSERT INTO public.landing_use_cases (title, description, tags, sort_order)
VALUES
  ('Weekly Connection', 'Structured check-ins keep meaningful dialogue active beyond daily routines.', ARRAY['Check-In', 'AI Summaries'], 1),
  ('Tracking Development', 'Use mood history and reports to understand growth over time.', ARRAY['Mood', 'Insights', 'Academic'], 2),
  ('Fair Family Decisions', 'Voting and veto combine shared voice with parent authority.', ARRAY['Voting', 'Veto'], 3),
  ('Goal-Setting Together', 'Co-create goals across academic, social, and personal dimensions.', ARRAY['Goals', 'Celebrations'], 4),
  ('Coordinating Two Homes', 'Co-parents stay aligned through shared access and notes.', ARRAY['Co-Parent', 'Notes'], 5),
  ('Planning Family Activities', 'Discover and plan experiences with Explorer and polls.', ARRAY['Explorer', 'Voting', 'Calendar'], 6)
ON CONFLICT DO NOTHING;

INSERT INTO public.landing_gallery_items (icon, title, subtitle, color_token, sort_order)
VALUES
  ('🏆', 'Reading Goal — Completed', 'Milestone unlocked', 'sage', 1),
  ('🎳', 'Family Night — Bowling', 'Weekend activity', 'amber', 2),
  ('📚', 'Math — Best Month Yet', 'Academic progress', 'sky', 3),
  ('🌱', 'New Personal Goal Set', 'Growth track', 'rose', 4),
  ('✨', 'Confidence Milestone', 'Social development', 'lav', 5),
  ('👥', 'Social Goal — In Progress', 'Collaboration', 'teal', 6)
ON CONFLICT DO NOTHING;
