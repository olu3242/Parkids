# PAR-KIDS — Complete Database Schema
**Version:** 1.0 | **Database:** PostgreSQL via Supabase

---

## OVERVIEW

The Par-Kids database is designed for:
- Multi-parent, multi-child household support
- Role-based access control at the row level
- Soft delete strategy across all core tables
- COPPA/GDPR compliance with PII isolation
- Extensibility for Phase 2 features (chores, rewards, counselor access)

All tables include: `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`, and soft delete via `deleted_at TIMESTAMPTZ` where applicable.

---

## ENUMS

```sql
-- User roles within the platform
CREATE TYPE user_role AS ENUM ('admin', 'parent', 'co_parent', 'caregiver', 'child');

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'family_pro');

-- Check-in frequency options
CREATE TYPE checkin_frequency AS ENUM ('weekly', 'biweekly');

-- Check-in status
CREATE TYPE checkin_status AS ENUM ('scheduled', 'in_progress', 'completed', 'missed', 'cancelled');

-- Goal categories
CREATE TYPE goal_category AS ENUM ('academic', 'social', 'personal', 'family', 'health', 'creative');

-- Goal status
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'paused', 'abandoned');

-- Academic performance levels
CREATE TYPE performance_level AS ENUM ('excellent', 'good', 'average', 'struggling', 'needs_support');

-- Mood scale (1-5)
CREATE TYPE mood_level AS ENUM ('1', '2', '3', '4', '5');

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'checkin_reminder', 'checkin_completed', 'goal_due', 'goal_completed',
  'mood_alert', 'summary_ready', 'co_parent_invite', 'system'
);

-- Notification channels
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'sms', 'in_app');

-- Relationship type to child
CREATE TYPE relationship_type AS ENUM ('parent', 'co_parent', 'caregiver', 'guardian');

-- Access level for co-parents/caregivers
CREATE TYPE access_level AS ENUM ('full', 'view_only', 'summary_only');

-- Gender (optional, child profile)
CREATE TYPE gender_option AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say', 'other');
```

---

## TABLE DEFINITIONS

---

### 1. users
**Purpose:** Master user record for all account holders. Both parents and children have user records, differentiated by role.

```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE,                          -- NULL for child accounts
  phone             TEXT,                                 -- Optional
  role              user_role NOT NULL DEFAULT 'parent',
  first_name        TEXT NOT NULL,
  last_name         TEXT,
  avatar_url        TEXT,                                 -- Supabase Storage URL
  date_of_birth     DATE,                                 -- Required for children
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active         BOOLEAN DEFAULT TRUE,
  last_login_at     TIMESTAMPTZ,
  locale            TEXT DEFAULT 'en',
  timezone          TEXT DEFAULT 'America/New_York',
  deleted_at        TIMESTAMPTZ,                          -- Soft delete
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
```

---

### 2. parent_profiles
**Purpose:** Extended profile data for parent/guardian users.

```sql
CREATE TABLE parent_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occupation          TEXT,
  parenting_goals     TEXT[],                             -- Array of text goals
  preferred_checkin_day TEXT,                             -- e.g., 'Sunday'
  preferred_checkin_time TIME,
  notification_preferences JSONB DEFAULT '{}',           -- per-channel prefs
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step     INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_parent_profiles_user_id ON parent_profiles(user_id);
```

---

### 3. child_profiles
**Purpose:** Extended profile data for child users. Contains developmental baseline and preferences.

```sql
CREATE TABLE child_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nickname          TEXT,
  grade             TEXT,                                 -- e.g., '5th Grade'
  school_name       TEXT,
  interests         TEXT[],                               -- e.g., ['soccer', 'reading']
  learning_style    TEXT,                                 -- e.g., 'visual', 'hands-on'
  personality_notes TEXT,                                 -- Parent-entered notes
  age_group         TEXT GENERATED ALWAYS AS (
    CASE
      WHEN EXTRACT(YEAR FROM AGE(users.date_of_birth)) BETWEEN 6 AND 10 THEN 'early'
      WHEN EXTRACT(YEAR FROM AGE(users.date_of_birth)) BETWEEN 11 AND 13 THEN 'preteen'
      WHEN EXTRACT(YEAR FROM AGE(users.date_of_birth)) BETWEEN 14 AND 17 THEN 'teen'
      ELSE 'unknown'
    END
  ) STORED,                                               -- Computed from user DOB (via trigger in practice)
  avatar_url        TEXT,
  avatar_color      TEXT DEFAULT '#4F86C6',               -- Personalized color
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Note: age_group computed via application layer or trigger in production
CREATE UNIQUE INDEX idx_child_profiles_user_id ON child_profiles(user_id);
```

---

### 4. households
**Purpose:** Represents a family unit. One household can have multiple parents and multiple children.

```sql
CREATE TABLE households (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL DEFAULT 'Our Family',    -- e.g., "The Johnson Family"
  primary_user_id UUID NOT NULL REFERENCES users(id),    -- The account owner
  subscription_tier subscription_tier DEFAULT 'free',
  timezone        TEXT DEFAULT 'America/New_York',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_households_primary_user ON households(primary_user_id);
```

---

### 5. household_members
**Purpose:** Junction table connecting users to households with role and access level.

```sql
CREATE TABLE household_members (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id   UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role           user_role NOT NULL,
  access_level   access_level DEFAULT 'full',
  invited_by     UUID REFERENCES users(id),
  invite_accepted_at TIMESTAMPTZ,
  is_active      BOOLEAN DEFAULT TRUE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(household_id, user_id)
);

CREATE INDEX idx_household_members_household ON household_members(household_id);
CREATE INDEX idx_household_members_user ON household_members(user_id);
```

---

### 6. parent_child_relationships
**Purpose:** Defines which parents have access to which children, with relationship type and permissions.

```sql
CREATE TABLE parent_child_relationships (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  household_id     UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  relationship_type relationship_type NOT NULL DEFAULT 'parent',
  access_level     access_level DEFAULT 'full',
  can_edit_profile BOOLEAN DEFAULT TRUE,
  can_view_responses BOOLEAN DEFAULT TRUE,              -- Can see child's check-in responses
  can_add_notes    BOOLEAN DEFAULT TRUE,
  is_primary       BOOLEAN DEFAULT FALSE,               -- Primary parent flag
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(parent_user_id, child_user_id)
);

CREATE INDEX idx_pcr_parent ON parent_child_relationships(parent_user_id);
CREATE INDEX idx_pcr_child ON parent_child_relationships(child_user_id);
CREATE INDEX idx_pcr_household ON parent_child_relationships(household_id);
```

---

### 7. check_in_templates
**Purpose:** Defines the structure and questions used in guided check-ins. Templates vary by age group.

```sql
CREATE TABLE check_in_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,                           -- e.g., 'Weekly Check-In - Teen'
  description  TEXT,
  age_group    TEXT NOT NULL,                           -- 'early', 'preteen', 'teen', 'all'
  frequency    checkin_frequency DEFAULT 'weekly',
  sections     JSONB NOT NULL,                          -- Array of section definitions
  is_default   BOOLEAN DEFAULT FALSE,
  is_active    BOOLEAN DEFAULT TRUE,
  version      INTEGER DEFAULT 1,
  created_by   UUID REFERENCES users(id),              -- NULL = system template
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- sections JSONB structure example:
-- [
--   {
--     "id": "mood",
--     "title": "How Are You Feeling?",
--     "order": 1,
--     "respondent": "child",  -- 'child', 'parent', 'both'
--     "questions": [
--       { "id": "q1", "text": "How are you feeling today?", "type": "mood_scale" },
--       { "id": "q2", "text": "What's one word for your week?", "type": "short_text" }
--     ]
--   }
-- ]

CREATE INDEX idx_templates_age_group ON check_in_templates(age_group) WHERE is_active = TRUE;
```

---

### 8. check_ins
**Purpose:** Records each check-in session between a parent and child.

```sql
CREATE TABLE check_ins (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     UUID NOT NULL REFERENCES households(id),
  child_user_id    UUID NOT NULL REFERENCES users(id),
  parent_user_id   UUID NOT NULL REFERENCES users(id),  -- Who initiated
  template_id      UUID REFERENCES check_in_templates(id),
  status           checkin_status DEFAULT 'scheduled',
  frequency        checkin_frequency DEFAULT 'weekly',
  scheduled_at     TIMESTAMPTZ NOT NULL,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  child_completed_at   TIMESTAMPTZ,
  parent_completed_at  TIMESTAMPTZ,
  overall_mood     INTEGER,                              -- 1-5 composite
  summary_text     TEXT,                                 -- AI or system-generated summary
  parent_notes     TEXT,                                 -- Private parent notes
  is_makeup        BOOLEAN DEFAULT FALSE,               -- True if replacing a missed check-in
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkins_child ON check_ins(child_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_checkins_parent ON check_ins(parent_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_checkins_household ON check_ins(household_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_checkins_scheduled ON check_ins(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_checkins_status ON check_ins(status) WHERE deleted_at IS NULL;
```

---

### 9. check_in_sections
**Purpose:** Stores each section of a check-in with its completion state.

```sql
CREATE TABLE check_in_sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id     UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  section_key     TEXT NOT NULL,                        -- e.g., 'mood', 'school', 'social'
  section_title   TEXT NOT NULL,
  respondent      TEXT NOT NULL DEFAULT 'both',         -- 'child', 'parent', 'both'
  order_index     INTEGER NOT NULL,
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_by    UUID REFERENCES users(id),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checkin_sections_checkin ON check_in_sections(check_in_id);
```

---

### 10. check_in_responses
**Purpose:** Individual question responses within a check-in section.

```sql
CREATE TABLE check_in_responses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id      UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  section_id       UUID NOT NULL REFERENCES check_in_sections(id) ON DELETE CASCADE,
  question_id      TEXT NOT NULL,                       -- From template JSON
  question_text    TEXT NOT NULL,
  response_type    TEXT NOT NULL,                       -- 'mood_scale', 'text', 'multi_select', 'yes_no'
  response_value   TEXT,                                -- Raw value
  response_data    JSONB,                               -- Structured response for complex types
  responded_by     UUID NOT NULL REFERENCES users(id),
  responded_as     TEXT NOT NULL,                       -- 'child' or 'parent'
  flagged          BOOLEAN DEFAULT FALSE,               -- For alerts or review
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_checkin ON check_in_responses(check_in_id);
CREATE INDEX idx_responses_section ON check_in_responses(section_id);
CREATE INDEX idx_responses_user ON check_in_responses(responded_by);
```

---

### 11. goals
**Purpose:** Parent-child co-created goals tracked across check-ins.

```sql
CREATE TABLE goals (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     UUID NOT NULL REFERENCES households(id),
  child_user_id    UUID NOT NULL REFERENCES users(id),
  created_by       UUID NOT NULL REFERENCES users(id),
  category         goal_category NOT NULL DEFAULT 'personal',
  title            TEXT NOT NULL,
  description      TEXT,
  target_date      DATE,
  status           goal_status DEFAULT 'active',
  priority         INTEGER DEFAULT 2,                   -- 1=high, 2=medium, 3=low
  origin_checkin_id UUID REFERENCES check_ins(id),     -- Which check-in created this
  completed_at     TIMESTAMPTZ,
  abandoned_at     TIMESTAMPTZ,
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_child ON goals(child_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_status ON goals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_goals_household ON goals(household_id) WHERE deleted_at IS NULL;
```

---

### 12. goal_progress
**Purpose:** Tracks progress updates on goals, typically one per check-in.

```sql
CREATE TABLE goal_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id       UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  check_in_id   UUID REFERENCES check_ins(id),
  updated_by    UUID NOT NULL REFERENCES users(id),
  progress_note TEXT,
  progress_pct  INTEGER DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  emoji_rating  TEXT,                                   -- Child's self-rating emoji
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goal_progress_goal ON goal_progress(goal_id);
```

---

### 13. moods
**Purpose:** Standalone mood log entries. Can be from check-ins or standalone.

```sql
CREATE TABLE moods (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id UUID NOT NULL REFERENCES users(id),
  logged_by     UUID NOT NULL REFERENCES users(id),    -- Could be child or parent
  logged_as     TEXT NOT NULL DEFAULT 'child',         -- 'child' self-log or 'parent' observed
  check_in_id   UUID REFERENCES check_ins(id),
  mood_level    INTEGER NOT NULL CHECK (mood_level BETWEEN 1 AND 5),
  mood_emoji    TEXT,                                  -- Emoji representation
  mood_word     TEXT,                                  -- One-word description
  notes         TEXT,
  logged_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moods_child ON moods(child_user_id);
CREATE INDEX idx_moods_logged_at ON moods(logged_at);
```

---

### 14. academic_updates
**Purpose:** Tracks academic performance per subject or overall, per check-in or standalone.

```sql
CREATE TABLE academic_updates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id  UUID NOT NULL REFERENCES users(id),
  check_in_id    UUID REFERENCES check_ins(id),
  logged_by      UUID NOT NULL REFERENCES users(id),
  subject        TEXT,                                  -- e.g., 'Math', 'Overall'
  performance    performance_level NOT NULL DEFAULT 'average',
  grade_value    TEXT,                                  -- Optional: 'A', '92%', etc.
  notes          TEXT,
  upcoming_tests TEXT,
  teacher_notes  TEXT,
  logged_at      TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_academic_child ON academic_updates(child_user_id);
CREATE INDEX idx_academic_checkin ON academic_updates(check_in_id);
```

---

### 15. social_updates
**Purpose:** Records social experiences and peer interactions discussed during check-ins.

```sql
CREATE TABLE social_updates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id     UUID NOT NULL REFERENCES users(id),
  check_in_id       UUID REFERENCES check_ins(id),
  logged_by         UUID NOT NULL REFERENCES users(id),
  friendship_rating INTEGER CHECK (friendship_rating BETWEEN 1 AND 5),
  peer_notes        TEXT,
  conflict_noted    BOOLEAN DEFAULT FALSE,
  conflict_resolved BOOLEAN,
  positive_noted    BOOLEAN DEFAULT FALSE,
  positive_detail   TEXT,
  logged_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_child ON social_updates(child_user_id);
```

---

### 16. behavior_updates
**Purpose:** Optional behavioral reflection notes for tracking patterns.

```sql
CREATE TABLE behavior_updates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_user_id   UUID NOT NULL REFERENCES users(id),
  check_in_id     UUID REFERENCES check_ins(id),
  logged_by       UUID NOT NULL REFERENCES users(id),
  behavior_area   TEXT,                                 -- e.g., 'routine', 'attitude', 'responsibility'
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes           TEXT,
  logged_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_behavior_child ON behavior_updates(child_user_id);
```

---

### 17. bonding_activities
**Purpose:** Suggested and completed bonding activities linked to check-ins.

```sql
CREATE TABLE bonding_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,                                 -- e.g., 'outdoor', 'creative', 'learning'
  age_group       TEXT DEFAULT 'all',
  duration_mins   INTEGER,
  is_system       BOOLEAN DEFAULT TRUE,                 -- System vs user-created
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE checkin_bonding_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id     UUID NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  activity_id     UUID NOT NULL REFERENCES bonding_activities(id),
  household_id    UUID NOT NULL REFERENCES households(id),
  is_completed    BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 18. summary_reports
**Purpose:** Monthly or per-check-in summary reports, auto-generated or AI-assisted.

```sql
CREATE TABLE summary_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     UUID NOT NULL REFERENCES households(id),
  child_user_id    UUID NOT NULL REFERENCES users(id),
  report_type      TEXT NOT NULL DEFAULT 'monthly',     -- 'checkin', 'monthly', 'quarterly'
  period_start     DATE NOT NULL,
  period_end       DATE NOT NULL,
  title            TEXT,
  content          TEXT,                                 -- Markdown or HTML
  data_snapshot    JSONB,                                -- Raw aggregated data
  is_shared        BOOLEAN DEFAULT FALSE,
  share_token      TEXT UNIQUE,                         -- For secure link sharing
  generated_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_child ON summary_reports(child_user_id);
CREATE INDEX idx_reports_household ON summary_reports(household_id);
```

---

### 19. reminders
**Purpose:** Scheduled reminders for check-ins, goals, and activities.

```sql
CREATE TABLE reminders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id     UUID NOT NULL REFERENCES households(id),
  user_id          UUID NOT NULL REFERENCES users(id),
  reference_type   TEXT NOT NULL,                       -- 'check_in', 'goal', 'activity'
  reference_id     UUID NOT NULL,
  title            TEXT NOT NULL,
  body             TEXT,
  channel          notification_channel DEFAULT 'push',
  scheduled_for    TIMESTAMPTZ NOT NULL,
  sent_at          TIMESTAMPTZ,
  is_sent          BOOLEAN DEFAULT FALSE,
  is_cancelled     BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_scheduled ON reminders(scheduled_for) WHERE is_sent = FALSE AND is_cancelled = FALSE;
CREATE INDEX idx_reminders_user ON reminders(user_id);
```

---

### 20. notifications
**Purpose:** In-app notification log for all users.

```sql
CREATE TABLE notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type             notification_type NOT NULL,
  title            TEXT NOT NULL,
  body             TEXT,
  data             JSONB DEFAULT '{}',                  -- Metadata / deep link params
  is_read          BOOLEAN DEFAULT FALSE,
  read_at          TIMESTAMPTZ,
  channel          notification_channel DEFAULT 'in_app',
  sent_at          TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_sent ON notifications(sent_at);
```

---

### 21. subscriptions
**Purpose:** Manages household subscription plans.

```sql
CREATE TABLE subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id        UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  stripe_customer_id  TEXT,
  stripe_subscription_id TEXT,
  tier                subscription_tier NOT NULL DEFAULT 'free',
  status              TEXT DEFAULT 'active',            -- 'active', 'cancelled', 'past_due', 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  trial_ends_at       TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_household ON subscriptions(household_id);
```

---

### 22. app_settings
**Purpose:** Per-user app preferences and configuration.

```sql
CREATE TABLE app_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  push_notifications    BOOLEAN DEFAULT TRUE,
  email_notifications   BOOLEAN DEFAULT TRUE,
  checkin_reminders     BOOLEAN DEFAULT TRUE,
  reminder_lead_time    INTEGER DEFAULT 60,             -- Minutes before check-in
  theme                 TEXT DEFAULT 'light',
  language              TEXT DEFAULT 'en',
  child_lock_enabled    BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 23. audit_logs
**Purpose:** Immutable audit trail for sensitive operations.

```sql
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  action       TEXT NOT NULL,                           -- e.g., 'check_in.created', 'child.deleted'
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  old_data     JSONB,
  new_data     JSONB,
  ip_address   INET,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

---

## ERD RELATIONSHIPS (Plain English)

1. **users** is the central entity. Every person — parent, child, co-parent, caregiver — has a user record.

2. **households** represents the family unit. A user creates one household and becomes the primary member.

3. **household_members** connects users to households. A user can belong to multiple households (e.g., a child of divorced parents).

4. **parent_profiles** and **child_profiles** extend the users table with role-specific data. One-to-one with users.

5. **parent_child_relationships** defines which parents can see which children, with what access level. A child can have multiple parent relationships (mom, dad, grandparent).

6. **check_in_templates** defines question structures. Multiple templates exist for different age groups.

7. **check_ins** is the core activity record — one per scheduled session between a parent and child.

8. **check_in_sections** breaks each check-in into thematic blocks (mood, school, social, etc.).

9. **check_in_responses** stores individual question answers within sections.

10. **goals** are created during or after check-ins and belong to a child.

11. **goal_progress** tracks updates to goals, often tied to a check-in.

12. **moods**, **academic_updates**, **social_updates**, **behavior_updates** are domain-specific data points, mostly captured via check-in responses but stored in dedicated tables for trend querying.

13. **summary_reports** aggregate check-in data into readable monthly snapshots.

14. **bonding_activities** provides a library of suggested activities. **checkin_bonding_activities** records which activities were selected and completed per check-in.

15. **reminders** and **notifications** handle the communication layer.

16. **subscriptions** manages monetization at the household level.

17. **audit_logs** captures every sensitive action for compliance and debugging.

---

## MULTI-CHILD & MULTI-PARENT SUPPORT

- A household can have N children (child_profiles + household_members)
- A household can have N parent-level users (household_members with role='parent' or 'co_parent')
- Each child has independent check-in history, goals, and mood logs
- Co-parents are scoped by `parent_child_relationships.access_level`
- Co-parents with `view_only` can see summaries but not raw responses
- Co-parents with `summary_only` only see the generated summary_reports

---

## ROW-LEVEL SECURITY NOTES (Supabase RLS)

```sql
-- Parents can only see children in their household
-- Example policy:
CREATE POLICY "parents_see_own_children" ON check_ins
  FOR SELECT
  USING (
    parent_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM parent_child_relationships pcr
      WHERE pcr.parent_user_id = auth.uid()
        AND pcr.child_user_id = check_ins.child_user_id
    )
  );

-- Children can only see their own check-ins
CREATE POLICY "children_see_own_checkins" ON check_ins
  FOR SELECT
  USING (child_user_id = auth.uid());

-- Children cannot see parent_notes column
-- Handle via view or application-layer column filtering
```
