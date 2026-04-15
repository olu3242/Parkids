-- ============================================================
-- PAR-KIDS — Initial Database Migration
-- Migration: 001_initial_schema
-- Database: PostgreSQL (Supabase)
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'parent', 'co_parent', 'caregiver', 'child'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family_pro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE checkin_frequency AS ENUM ('weekly', 'biweekly'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE checkin_status AS ENUM ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE goal_category AS ENUM ('academic', 'social', 'personal', 'family', 'health', 'creative'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'abandoned'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE performance_level AS ENUM ('excellent', 'good', 'average', 'struggling', 'needs_support'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE access_level AS ENUM ('full', 'view_only', 'summary_only'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE relationship_type AS ENUM ('parent', 'co_parent', 'caregiver', 'guardian'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('checkin_reminder', 'checkin_completed', 'goal_due', 'goal_completed', 'mood_alert', 'summary_ready', 'co_parent_invite', 'system'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── HELPER FUNCTION: updated_at trigger ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ── TABLE: users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE,
  phone             TEXT,
  role              user_role NOT NULL DEFAULT 'parent',
  first_name        TEXT NOT NULL,
  last_name         TEXT,
  avatar_url        TEXT,
  date_of_birth     DATE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  last_login_at     TIMESTAMPTZ,
  locale            TEXT DEFAULT 'en',
  timezone          TEXT DEFAULT 'America/New_York',
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure legacy pre-existing users table has all columns required by this migration.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'parent';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: parent_profiles ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  occupation               TEXT,
  parenting_goals          TEXT[] DEFAULT '{}',
  preferred_checkin_day    TEXT,
  preferred_checkin_time   TIME,
  notification_preferences JSONB DEFAULT '{}',
  onboarding_completed     BOOLEAN DEFAULT FALSE,
  onboarding_step          INTEGER DEFAULT 0,
  created_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at               TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON public.parent_profiles(user_id);

DROP TRIGGER IF EXISTS update_parent_profiles_updated_at ON public.parent_profiles;
CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: child_profiles ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nickname          TEXT,
  grade             TEXT,
  school_name       TEXT,
  interests         TEXT[] DEFAULT '{}',
  learning_style    TEXT,
  personality_notes TEXT,
  age_group         TEXT,
  avatar_url        TEXT,
  avatar_color      TEXT DEFAULT '#3ABFBF',
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_child_profiles_user_id ON public.child_profiles(user_id);

DROP TRIGGER IF EXISTS update_child_profiles_updated_at ON public.child_profiles;
CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: households ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.households (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL DEFAULT 'Our Family',
  primary_user_id   UUID NOT NULL REFERENCES public.users(id),
  subscription_tier subscription_tier DEFAULT 'free',
  timezone          TEXT DEFAULT 'America/New_York',
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_households_primary_user ON public.households(primary_user_id);

DROP TRIGGER IF EXISTS update_households_updated_at ON public.households;
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: household_members ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.household_members (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id       UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role               user_role NOT NULL,
  access_level       access_level DEFAULT 'full',
  invited_by         UUID REFERENCES public.users(id),
  invite_accepted_at TIMESTAMPTZ,
  is_active          BOOLEAN DEFAULT TRUE,
  created_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at         TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(household_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_household_members_household ON public.household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user ON public.household_members(user_id);

-- ── TABLE: parent_child_relationships ────────────────────────
CREATE TABLE IF NOT EXISTS public.parent_child_relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  household_id      UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  relationship_type relationship_type NOT NULL DEFAULT 'parent',
  access_level      access_level DEFAULT 'full',
  can_edit_profile  BOOLEAN DEFAULT TRUE,
  can_view_responses BOOLEAN DEFAULT TRUE,
  can_add_notes     BOOLEAN DEFAULT TRUE,
  is_primary        BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(parent_user_id, child_user_id)
);

CREATE INDEX IF NOT EXISTS idx_pcr_parent ON public.parent_child_relationships(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_pcr_child ON public.parent_child_relationships(child_user_id);

-- ── TABLE: check_in_templates ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_in_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  age_group   TEXT NOT NULL DEFAULT 'all',
  frequency   checkin_frequency DEFAULT 'weekly',
  sections    JSONB NOT NULL DEFAULT '[]',
  is_default  BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  version     INTEGER DEFAULT 1,
  created_by  UUID REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_age_group ON public.check_in_templates(age_group) WHERE is_active = TRUE;

-- ── TABLE: check_ins ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_ins (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id        UUID NOT NULL REFERENCES public.households(id),
  child_user_id       UUID NOT NULL REFERENCES public.users(id),
  parent_user_id      UUID NOT NULL REFERENCES public.users(id),
  template_id         UUID REFERENCES public.check_in_templates(id),
  status              checkin_status DEFAULT 'scheduled',
  frequency           checkin_frequency DEFAULT 'weekly',
  scheduled_at        TIMESTAMPTZ NOT NULL,
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  child_completed_at  TIMESTAMPTZ,
  parent_completed_at TIMESTAMPTZ,
  overall_mood        INTEGER CHECK (overall_mood BETWEEN 1 AND 5),
  summary_text        TEXT,
  parent_notes        TEXT,
  is_makeup           BOOLEAN DEFAULT FALSE,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkins_child ON public.check_ins(child_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_parent ON public.check_ins(parent_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_household ON public.check_ins(household_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_scheduled ON public.check_ins(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_status ON public.check_ins(status) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_checkins_updated_at ON public.check_ins;
CREATE TRIGGER update_checkins_updated_at
  BEFORE UPDATE ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: check_in_sections ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_in_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id   UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
  section_key   TEXT NOT NULL,
  section_title TEXT NOT NULL,
  respondent    TEXT NOT NULL DEFAULT 'both',
  order_index   INTEGER NOT NULL,
  is_completed  BOOLEAN DEFAULT FALSE,
  completed_by  UUID REFERENCES public.users(id),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkin_sections_checkin ON public.check_in_sections(check_in_id);

-- ── TABLE: check_in_responses ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_in_responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id    UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
  section_id     UUID NOT NULL REFERENCES public.check_in_sections(id) ON DELETE CASCADE,
  question_id    TEXT NOT NULL,
  question_text  TEXT NOT NULL,
  response_type  TEXT NOT NULL,
  response_value TEXT,
  response_data  JSONB,
  responded_by   UUID NOT NULL REFERENCES public.users(id),
  responded_as   TEXT NOT NULL,
  flagged        BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_responses_checkin ON public.check_in_responses(check_in_id);
CREATE INDEX IF NOT EXISTS idx_responses_section ON public.check_in_responses(section_id);

-- ── TABLE: goals ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id      UUID NOT NULL REFERENCES public.households(id),
  child_user_id     UUID NOT NULL REFERENCES public.users(id),
  created_by        UUID NOT NULL REFERENCES public.users(id),
  category          goal_category NOT NULL DEFAULT 'personal',
  title             TEXT NOT NULL,
  description       TEXT,
  target_date       DATE,
  status            goal_status DEFAULT 'active',
  priority          INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  origin_checkin_id UUID REFERENCES public.check_ins(id),
  completed_at      TIMESTAMPTZ,
  abandoned_at      TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_child ON public.goals(child_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: goal_progress ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goal_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id       UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  check_in_id   UUID REFERENCES public.check_ins(id),
  updated_by    UUID NOT NULL REFERENCES public.users(id),
  progress_note TEXT,
  progress_pct  INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  emoji_rating  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON public.goal_progress(goal_id);

-- ── TABLE: moods ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.moods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id UUID NOT NULL REFERENCES public.users(id),
  logged_by     UUID NOT NULL REFERENCES public.users(id),
  logged_as     TEXT NOT NULL DEFAULT 'child',
  check_in_id   UUID REFERENCES public.check_ins(id),
  mood_level    INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  mood_emoji    TEXT,
  mood_word     TEXT,
  notes         TEXT,
  logged_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_moods_child ON public.moods(child_user_id);
CREATE INDEX IF NOT EXISTS idx_moods_logged_at ON public.moods(logged_at);

-- ── TABLE: academic_updates ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_updates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id UUID NOT NULL REFERENCES public.users(id),
  check_in_id   UUID REFERENCES public.check_ins(id),
  logged_by     UUID NOT NULL REFERENCES public.users(id),
  subject       TEXT,
  performance   performance_level NOT NULL DEFAULT 'average',
  grade_value   TEXT,
  notes         TEXT,
  upcoming_tests TEXT,
  teacher_notes TEXT,
  logged_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_academic_child ON public.academic_updates(child_user_id);

-- ── TABLE: bonding_activities ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonding_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT,
  age_group     TEXT DEFAULT 'all',
  duration_mins INTEGER,
  is_system     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES public.users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── TABLE: summary_reports ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.summary_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES public.households(id),
  child_user_id UUID NOT NULL REFERENCES public.users(id),
  report_type  TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  title        TEXT,
  content      TEXT,
  data_snapshot JSONB,
  is_shared    BOOLEAN DEFAULT FALSE,
  share_token  TEXT UNIQUE,
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_child ON public.summary_reports(child_user_id);

-- ── TABLE: notifications ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       notification_type NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  channel    notification_channel DEFAULT 'in_app',
  sent_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id) WHERE is_read = FALSE;

-- ── TABLE: subscriptions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id           UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  tier                   subscription_tier NOT NULL DEFAULT 'free',
  status                 TEXT DEFAULT 'active',
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  trial_ends_at          TIMESTAMPTZ,
  cancelled_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at             TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_household ON public.subscriptions(household_id);

-- ── TABLE: app_settings ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  push_notifications   BOOLEAN DEFAULT TRUE,
  email_notifications  BOOLEAN DEFAULT TRUE,
  checkin_reminders    BOOLEAN DEFAULT TRUE,
  reminder_lead_time   INTEGER DEFAULT 60,
  theme                TEXT DEFAULT 'light',
  language             TEXT DEFAULT 'en',
  child_lock_enabled   BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at           TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── TABLE: audit_logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: own record
DROP POLICY IF EXISTS "users_own_record" ON public.users;
CREATE POLICY "users_own_record" ON public.users
  FOR ALL USING (id = auth.uid());

-- Users: parents see household children
DROP POLICY IF EXISTS "parents_see_household_children" ON public.users;
CREATE POLICY "parents_see_household_children" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = public.users.id
    )
  );

-- Check-ins: parents see their own or children's
DROP POLICY IF EXISTS "checkins_parent_access" ON public.check_ins;
CREATE POLICY "checkins_parent_access" ON public.check_ins
  FOR ALL USING (
    parent_user_id = auth.uid()
    OR child_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = public.check_ins.child_user_id
    )
  );

-- Goals: household access
DROP POLICY IF EXISTS "goals_household_access" ON public.goals;
CREATE POLICY "goals_household_access" ON public.goals
  FOR ALL USING (
    child_user_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = public.goals.child_user_id
    )
  );

-- Notifications: own only
DROP POLICY IF EXISTS "notifications_own_only" ON public.notifications;
CREATE POLICY "notifications_own_only" ON public.notifications
  FOR ALL USING (user_id = auth.uid());
-- ============================================================
-- PAR-KIDS — Initial Database Migration
-- Migration: 001_initial_schema
-- Database: PostgreSQL (Supabase)
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ────────────────────────────────────────────────────
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'parent', 'co_parent', 'caregiver', 'child'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family_pro'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE checkin_frequency AS ENUM ('weekly', 'biweekly'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE checkin_status AS ENUM ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE goal_category AS ENUM ('academic', 'social', 'personal', 'family', 'health', 'creative'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'abandoned'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE performance_level AS ENUM ('excellent', 'good', 'average', 'struggling', 'needs_support'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE access_level AS ENUM ('full', 'view_only', 'summary_only'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE relationship_type AS ENUM ('parent', 'co_parent', 'caregiver', 'guardian'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_type AS ENUM ('checkin_reminder', 'checkin_completed', 'goal_due', 'goal_completed', 'mood_alert', 'summary_ready', 'co_parent_invite', 'system'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── HELPER FUNCTION: updated_at trigger ──────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ── TABLE: users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE,
  phone             TEXT,
  role              user_role NOT NULL DEFAULT 'parent',
  first_name        TEXT NOT NULL,
  last_name         TEXT,
  avatar_url        TEXT,
  date_of_birth     DATE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  last_login_at     TIMESTAMPTZ,
  locale            TEXT DEFAULT 'en',
  timezone          TEXT DEFAULT 'America/New_York',
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: parent_profiles ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.parent_profiles (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  occupation              TEXT,
  parenting_goals         TEXT[] DEFAULT '{}',
  preferred_checkin_day   TEXT,
  preferred_checkin_time  TIME,
  notification_preferences JSONB DEFAULT '{}',
  onboarding_completed    BOOLEAN DEFAULT FALSE,
  onboarding_step         INTEGER DEFAULT 0,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON public.parent_profiles(user_id);

DROP TRIGGER IF EXISTS update_parent_profiles_updated_at ON public.parent_profiles;
CREATE TRIGGER update_parent_profiles_updated_at
  BEFORE UPDATE ON public.parent_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: child_profiles ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.child_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nickname          TEXT,
  grade             TEXT,
  school_name       TEXT,
  interests         TEXT[] DEFAULT '{}',
  learning_style    TEXT,
  personality_notes TEXT,
  age_group         TEXT,
  avatar_url        TEXT,
  avatar_color      TEXT DEFAULT '#3ABFBF',
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_child_profiles_user_id ON public.child_profiles(user_id);

DROP TRIGGER IF EXISTS update_child_profiles_updated_at ON public.child_profiles;
CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON public.child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: households ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.households (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL DEFAULT 'Our Family',
  primary_user_id   UUID NOT NULL REFERENCES public.users(id),
  subscription_tier subscription_tier DEFAULT 'free',
  timezone          TEXT DEFAULT 'America/New_York',
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_households_primary_user ON public.households(primary_user_id);

DROP TRIGGER IF EXISTS update_households_updated_at ON public.households;
CREATE TRIGGER update_households_updated_at
  BEFORE UPDATE ON public.households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: household_members ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.household_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id        UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role                user_role NOT NULL,
  access_level        access_level DEFAULT 'full',
  invited_by          UUID REFERENCES public.users(id),
  invite_accepted_at  TIMESTAMPTZ,
  is_active           BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(household_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_household_members_household ON public.household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user ON public.household_members(user_id);

-- ── TABLE: parent_child_relationships ────────────────────────
CREATE TABLE IF NOT EXISTS public.parent_child_relationships (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  household_id        UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  relationship_type   relationship_type NOT NULL DEFAULT 'parent',
  access_level        access_level DEFAULT 'full',
  can_edit_profile    BOOLEAN DEFAULT TRUE,
  can_view_responses  BOOLEAN DEFAULT TRUE,
  can_add_notes       BOOLEAN DEFAULT TRUE,
  is_primary          BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(parent_user_id, child_user_id)
);

CREATE INDEX IF NOT EXISTS idx_pcr_parent ON public.parent_child_relationships(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_pcr_child ON public.parent_child_relationships(child_user_id);

-- ── TABLE: check_in_templates ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_in_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  age_group   TEXT NOT NULL DEFAULT 'all',
  frequency   checkin_frequency DEFAULT 'weekly',
  sections    JSONB NOT NULL DEFAULT '[]',
  is_default  BOOLEAN DEFAULT FALSE,
  is_active   BOOLEAN DEFAULT TRUE,
  version     INTEGER DEFAULT 1,
  created_by  UUID REFERENCES public.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_templates_age_group ON public.check_in_templates(age_group) WHERE is_active = TRUE;

-- ── TABLE: check_ins ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_ins (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id          UUID NOT NULL REFERENCES public.households(id),
  child_user_id         UUID NOT NULL REFERENCES public.users(id),
  parent_user_id        UUID NOT NULL REFERENCES public.users(id),
  template_id           UUID REFERENCES public.check_in_templates(id),
  status                checkin_status DEFAULT 'scheduled',
  frequency             checkin_frequency DEFAULT 'weekly',
  scheduled_at          TIMESTAMPTZ NOT NULL,
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  child_completed_at    TIMESTAMPTZ,
  parent_completed_at   TIMESTAMPTZ,
  overall_mood          INTEGER CHECK (overall_mood BETWEEN 1 AND 5),
  summary_text          TEXT,
  parent_notes          TEXT,
  is_makeup             BOOLEAN DEFAULT FALSE,
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkins_child ON public.check_ins(child_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_parent ON public.check_ins(parent_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_household ON public.check_ins(household_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_scheduled ON public.check_ins(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_checkins_status ON public.check_ins(status) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_checkins_updated_at ON public.check_ins;
CREATE TRIGGER update_checkins_updated_at
  BEFORE UPDATE ON public.check_ins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: check_in_sections ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_in_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id   UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
  section_key   TEXT NOT NULL,
  section_title TEXT NOT NULL,
  respondent    TEXT NOT NULL DEFAULT 'both',
  order_index   INTEGER NOT NULL,
  is_completed  BOOLEAN DEFAULT FALSE,
  completed_by  UUID REFERENCES public.users(id),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_checkin_sections_checkin ON public.check_in_sections(check_in_id);

-- ── TABLE: check_in_responses ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.check_in_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id     UUID NOT NULL REFERENCES public.check_ins(id) ON DELETE CASCADE,
  section_id      UUID NOT NULL REFERENCES public.check_in_sections(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  question_text   TEXT NOT NULL,
  response_type   TEXT NOT NULL,
  response_value  TEXT,
  response_data   JSONB,
  responded_by    UUID NOT NULL REFERENCES public.users(id),
  responded_as    TEXT NOT NULL,
  flagged         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_responses_checkin ON public.check_in_responses(check_in_id);
CREATE INDEX IF NOT EXISTS idx_responses_section ON public.check_in_responses(section_id);

-- ── TABLE: goals ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id        UUID NOT NULL REFERENCES public.households(id),
  child_user_id       UUID NOT NULL REFERENCES public.users(id),
  created_by          UUID NOT NULL REFERENCES public.users(id),
  category            goal_category NOT NULL DEFAULT 'personal',
  title               TEXT NOT NULL,
  description         TEXT,
  target_date         DATE,
  status              goal_status DEFAULT 'active',
  priority            INTEGER DEFAULT 2 CHECK (priority IN (1, 2, 3)),
  origin_checkin_id   UUID REFERENCES public.check_ins(id),
  completed_at        TIMESTAMPTZ,
  abandoned_at        TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_child ON public.goals(child_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.goals(status) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── TABLE: goal_progress ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goal_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id         UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  check_in_id     UUID REFERENCES public.check_ins(id),
  updated_by      UUID NOT NULL REFERENCES public.users(id),
  progress_note   TEXT,
  progress_pct    INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  emoji_rating    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON public.goal_progress(goal_id);

-- ── TABLE: moods ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.moods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id   UUID NOT NULL REFERENCES public.users(id),
  logged_by       UUID NOT NULL REFERENCES public.users(id),
  logged_as       TEXT NOT NULL DEFAULT 'child',
  check_in_id     UUID REFERENCES public.check_ins(id),
  mood_level      INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  mood_emoji      TEXT,
  mood_word       TEXT,
  notes           TEXT,
  logged_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_moods_child ON public.moods(child_user_id);
CREATE INDEX IF NOT EXISTS idx_moods_logged_at ON public.moods(logged_at);

-- ── TABLE: academic_updates ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.academic_updates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id   UUID NOT NULL REFERENCES public.users(id),
  check_in_id     UUID REFERENCES public.check_ins(id),
  logged_by       UUID NOT NULL REFERENCES public.users(id),
  subject         TEXT,
  performance     performance_level NOT NULL DEFAULT 'average',
  grade_value     TEXT,
  notes           TEXT,
  upcoming_tests  TEXT,
  teacher_notes   TEXT,
  logged_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_academic_child ON public.academic_updates(child_user_id);

-- ── TABLE: bonding_activities ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bonding_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,
  age_group       TEXT DEFAULT 'all',
  duration_mins   INTEGER,
  is_system       BOOLEAN DEFAULT TRUE,
  created_by      UUID REFERENCES public.users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── TABLE: summary_reports ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.summary_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES public.households(id),
  child_user_id   UUID NOT NULL REFERENCES public.users(id),
  report_type     TEXT NOT NULL DEFAULT 'monthly',
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  title           TEXT,
  content         TEXT,
  data_snapshot   JSONB,
  is_shared       BOOLEAN DEFAULT FALSE,
  share_token     TEXT UNIQUE,
  generated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_child ON public.summary_reports(child_user_id);

-- ── TABLE: notifications ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  channel     notification_channel DEFAULT 'in_app',
  sent_at     TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id) WHERE is_read = FALSE;

-- ── TABLE: subscriptions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id            UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  tier                    subscription_tier NOT NULL DEFAULT 'free',
  status                  TEXT DEFAULT 'active',
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  trial_ends_at           TIMESTAMPTZ,
  cancelled_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at              TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_household ON public.subscriptions(household_id);

-- ── TABLE: app_settings ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.app_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  push_notifications    BOOLEAN DEFAULT TRUE,
  email_notifications   BOOLEAN DEFAULT TRUE,
  checkin_reminders     BOOLEAN DEFAULT TRUE,
  reminder_lead_time    INTEGER DEFAULT 60,
  theme                 TEXT DEFAULT 'light',
  language              TEXT DEFAULT 'en',
  child_lock_enabled    BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at            TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ── TABLE: audit_logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.users(id),
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  old_data     JSONB,
  new_data     JSONB,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users: own record
DROP POLICY IF EXISTS "users_own_record" ON public.users;
CREATE POLICY "users_own_record" ON public.users
  FOR ALL USING (id = auth.uid());

-- Users: parents see household children
DROP POLICY IF EXISTS "parents_see_household_children" ON public.users;
CREATE POLICY "parents_see_household_children" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = public.users.id
    )
  );

-- Check-ins: parents see their own or children's
DROP POLICY IF EXISTS "checkins_parent_access" ON public.check_ins;
CREATE POLICY "checkins_parent_access" ON public.check_ins
  FOR ALL USING (
    parent_user_id = auth.uid()
    OR child_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = public.check_ins.child_user_id
    )
  );

-- Goals: household access
DROP POLICY IF EXISTS "goals_household_access" ON public.goals;
CREATE POLICY "goals_household_access" ON public.goals
  FOR ALL USING (
    child_user_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = public.goals.child_user_id
    )
  );

-- Notifications: own only
DROP POLICY IF EXISTS "notifications_own_only" ON public.notifications;
CREATE POLICY "notifications_own_only" ON public.notifications
  FOR ALL USING (user_id = auth.uid());
