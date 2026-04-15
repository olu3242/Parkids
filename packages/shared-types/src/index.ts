// ============================================================
// PAR-KIDS — Shared TypeScript Types
// Used across web, mobile, and backend
// ============================================================

// ── ENUMS ────────────────────────────────────────────────────

export type UserRole = 'admin' | 'parent' | 'co_parent' | 'caregiver' | 'child';

export type SubscriptionTier = 'free' | 'premium' | 'family_pro';

export type CheckInFrequency = 'weekly' | 'biweekly';

export type CheckInStatus = 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled';

export type GoalCategory = 'academic' | 'social' | 'personal' | 'family' | 'health' | 'creative';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export type PerformanceLevel = 'excellent' | 'good' | 'average' | 'struggling' | 'needs_support';

export type AccessLevel = 'full' | 'view_only' | 'summary_only';

export type RelationshipType = 'parent' | 'co_parent' | 'caregiver' | 'guardian';

export type AgeGroup = 'early' | 'preteen' | 'teen';

export type NotificationType =
  | 'checkin_reminder'
  | 'checkin_completed'
  | 'goal_due'
  | 'goal_completed'
  | 'mood_alert'
  | 'summary_ready'
  | 'co_parent_invite'
  | 'system';

// ── USER TYPES ────────────────────────────────────────────────

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  first_name: string;
  last_name?: string;
  avatar_url?: string;
  date_of_birth?: string; // ISO date
  is_email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  occupation?: string;
  parenting_goals?: string[];
  preferred_checkin_day?: string;
  preferred_checkin_time?: string;
  notification_preferences: Record<string, boolean>;
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface ChildProfile {
  id: string;
  user_id: string;
  nickname?: string;
  grade?: string;
  school_name?: string;
  interests?: string[];
  learning_style?: string;
  personality_notes?: string;
  age_group?: AgeGroup;
  avatar_url?: string;
  avatar_color: string;
  created_at: string;
  updated_at: string;
  // Joined
  user?: User;
}

// ── HOUSEHOLD TYPES ───────────────────────────────────────────

export interface Household {
  id: string;
  name: string;
  primary_user_id: string;
  subscription_tier: SubscriptionTier;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: UserRole;
  access_level: AccessLevel;
  invited_by?: string;
  invite_accepted_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface ParentChildRelationship {
  id: string;
  parent_user_id: string;
  child_user_id: string;
  household_id: string;
  relationship_type: RelationshipType;
  access_level: AccessLevel;
  can_edit_profile: boolean;
  can_view_responses: boolean;
  can_add_notes: boolean;
  is_primary: boolean;
  created_at: string;
}

// ── CHECK-IN TYPES ─────────────────────────────────────────────

export interface CheckInQuestion {
  id: string;
  text: string;
  type: 'mood_scale' | 'short_text' | 'long_text' | 'multi_select' | 'yes_no' | 'emoji_pick' | 'rating';
  options?: string[]; // For multi_select
  placeholder?: string;
  required?: boolean;
  age_groups?: AgeGroup[];
}

export interface CheckInSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  order: number;
  respondent: 'child' | 'parent' | 'both';
  questions: CheckInQuestion[];
}

export interface CheckInTemplate {
  id: string;
  name: string;
  description?: string;
  age_group: AgeGroup | 'all';
  frequency: CheckInFrequency;
  sections: CheckInSection[];
  is_default: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
}

export interface CheckIn {
  id: string;
  household_id: string;
  child_user_id: string;
  parent_user_id: string;
  template_id?: string;
  status: CheckInStatus;
  frequency: CheckInFrequency;
  scheduled_at: string;
  started_at?: string;
  completed_at?: string;
  child_completed_at?: string;
  parent_completed_at?: string;
  overall_mood?: number;
  summary_text?: string;
  parent_notes?: string;
  is_makeup: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  child?: User & { child_profile?: ChildProfile };
  sections?: CheckInSectionRecord[];
}

export interface CheckInSectionRecord {
  id: string;
  check_in_id: string;
  section_key: string;
  section_title: string;
  respondent: string;
  order_index: number;
  is_completed: boolean;
  completed_by?: string;
  completed_at?: string;
  responses?: CheckInResponse[];
}

export interface CheckInResponse {
  id: string;
  check_in_id: string;
  section_id: string;
  question_id: string;
  question_text: string;
  response_type: string;
  response_value?: string;
  response_data?: Record<string, unknown>;
  responded_by: string;
  responded_as: 'child' | 'parent';
  flagged: boolean;
  created_at: string;
}

// ── GOAL TYPES ────────────────────────────────────────────────

export interface Goal {
  id: string;
  household_id: string;
  child_user_id: string;
  created_by: string;
  category: GoalCategory;
  title: string;
  description?: string;
  target_date?: string;
  status: GoalStatus;
  priority: 1 | 2 | 3;
  origin_checkin_id?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  progress?: GoalProgress[];
}

export interface GoalProgress {
  id: string;
  goal_id: string;
  check_in_id?: string;
  updated_by: string;
  progress_note?: string;
  progress_pct: number;
  emoji_rating?: string;
  created_at: string;
}

// ── MOOD TYPES ────────────────────────────────────────────────

export interface MoodEntry {
  id: string;
  child_user_id: string;
  logged_by: string;
  logged_as: 'child' | 'parent';
  check_in_id?: string;
  mood_level: 1 | 2 | 3 | 4 | 5;
  mood_emoji?: string;
  mood_word?: string;
  notes?: string;
  logged_at: string;
}

// ── NOTIFICATION TYPES ────────────────────────────────────────

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  sent_at: string;
}

// ── SUMMARY REPORT TYPES ──────────────────────────────────────

export interface SummaryReport {
  id: string;
  household_id: string;
  child_user_id: string;
  report_type: 'checkin' | 'monthly' | 'quarterly';
  period_start: string;
  period_end: string;
  title?: string;
  content?: string;
  data_snapshot?: Record<string, unknown>;
  is_shared: boolean;
  share_token?: string;
  generated_at: string;
}

// ── BONDING ACTIVITY TYPES ────────────────────────────────────

export interface BondingActivity {
  id: string;
  title: string;
  description?: string;
  category?: string;
  age_group: AgeGroup | 'all';
  duration_mins?: number;
  is_system: boolean;
}

// ── API RESPONSE TYPES ────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// ── ONBOARDING TYPES ──────────────────────────────────────────

export interface OnboardingState {
  step: number;
  parentProfile: Partial<ParentProfile>;
  children: Partial<ChildProfile & User>[];
  schedule: {
    frequency: CheckInFrequency;
    preferred_day?: string;
    preferred_time?: string;
  };
  goals: string[];
}

// ── ANALYTICS TYPES ───────────────────────────────────────────

export interface MoodTrendPoint {
  date: string;
  mood_level: number;
  label?: string;
}

export interface ChildGrowthSummary {
  child_id: string;
  check_ins_completed: number;
  check_ins_missed: number;
  avg_mood: number;
  mood_trend: MoodTrendPoint[];
  goals_active: number;
  goals_completed: number;
  academic_trend: {
    subject: string;
    performance: PerformanceLevel;
  }[];
}
