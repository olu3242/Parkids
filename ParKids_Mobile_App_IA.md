# PAR-KIDS — Mobile App Information Architecture
**Version:** 1.0 | **Platform:** React Native + Expo

---

## OVERVIEW

The Par-Kids mobile app serves two distinct user types with shared infrastructure:
- **Parent Mode:** Full dashboard, check-in management, analytics, child profiles
- **Child Mode:** Simplified, age-appropriate check-in participation and goal tracking

The app detects the user's role on login and routes to the appropriate experience.

---

## PRIMARY NAVIGATION

### Parent App — Bottom Tab Navigation
| Tab | Icon | Label |
|---|---|---|
| 1 | 🏠 | Home |
| 2 | 👤 | Children |
| 3 | ✅ | Check-Ins |
| 4 | 📊 | Growth |
| 5 | ⚙️ | Settings |

### Child App — Bottom Tab Navigation (Simplified)
| Tab | Icon | Label |
|---|---|---|
| 1 | 🏠 | Home |
| 2 | ✅ | My Check-In |
| 3 | 🎯 | My Goals |
| 4 | 😊 | My Mood |

---

## PARENT APP — FULL SCREEN LIST

### AUTHENTICATION SCREENS
- **SplashScreen** — Animated logo, auto-navigate to auth
- **WelcomeScreen** — Value prop, Get Started / Login options
- **LoginScreen** — Email/password, social login (Google, Apple)
- **RegisterScreen** — Name, email, password, role=parent
- **ForgotPasswordScreen** — Email entry, reset link sent
- **ResetPasswordScreen** — New password entry

### ONBOARDING SCREENS (First Launch Only)
- **Onboarding_Step1_Welcome** — "Welcome to Par-Kids" intro
- **Onboarding_Step2_Profile** — Parent profile setup (name, photo)
- **Onboarding_Step3_AddChild** — Add first child profile
- **Onboarding_Step4_ChildDetails** — Child name, DOB, grade, interests
- **Onboarding_Step5_Schedule** — Set check-in frequency and day
- **Onboarding_Step6_Goals** — Parent's top goals for using the app
- **Onboarding_Step7_Complete** — "You're ready! Let's start."

### HOME TAB
- **HomeScreen** — Dashboard overview
  - Active child selector (horizontal scroll)
  - Next check-in countdown card
  - Quick mood snapshot
  - Recent goals card
  - Suggested bonding activity card
  - Monthly progress ring
  - Notification center shortcut

### CHILDREN TAB
- **ChildrenListScreen** — All children in household, quick summary cards
- **ChildProfileScreen** — Individual child detail
  - Photo, name, age, grade
  - Mood trend mini-chart
  - Academic status
  - Active goals
  - Recent check-in summary
  - Edit profile shortcut
- **AddChildScreen** — Create new child profile
- **EditChildScreen** — Edit existing child profile
- **ChildInsightsScreen** — Deep analytics for one child

### CHECK-INS TAB
- **CheckInsListScreen** — All upcoming and past check-ins
  - Filter by child, status, date
- **CheckInDetailScreen** — View a completed check-in summary
- **ScheduleCheckInScreen** — Create/reschedule a check-in
- **CheckInFlowScreen** — Active guided check-in (multi-step)
  - Step 1: Mood & Feelings
  - Step 2: School & Learning
  - Step 3: Friendships & Social
  - Step 4: Confidence & Self
  - Step 5: Habits & Routines
  - Step 6: Challenges & Worries
  - Step 7: Wins & Proud Moments
  - Step 8: Goals Review
  - Step 9: Parent Reflection
  - Step 10: Bonding Activity Pick
  - Summary Screen: Generated summary
- **CheckInSummaryScreen** — Post-check-in summary view
- **MissedCheckInScreen** — Reschedule prompt with encouragement

### GROWTH TAB
- **GrowthDashboardScreen** — Multi-dimension overview
  - Mood trend (line chart)
  - Academic trend (bar chart)
  - Goals completion rate (ring chart)
  - Social wellbeing trend
- **GoalsListScreen** — All goals per child
- **GoalDetailScreen** — Single goal with progress history
- **AddGoalScreen** — Create new goal
- **EditGoalScreen** — Update goal
- **MoodHistoryScreen** — Full mood history with filters
- **AcademicHistoryScreen** — Subject performance over time
- **ReportsScreen** — Monthly summary reports list
- **ReportDetailScreen** — Full report view
- **ShareReportScreen** — Share options (PDF, link)

### SETTINGS TAB
- **SettingsHomeScreen** — Settings menu
- **AccountScreen** — Parent profile edit
- **HouseholdScreen** — Household management
- **CoParentManageScreen** — Invite / manage co-parents
- **ChildPermissionsScreen** — Per-child access controls
- **NotificationSettingsScreen** — Push, email, reminder preferences
- **SubscriptionScreen** — Current plan, upgrade options
- **PrivacyScreen** — Data, export, delete options
- **HelpScreen** — FAQ, contact support
- **AboutScreen** — Version, legal, terms

---

## CHILD APP — FULL SCREEN LIST

### AUTHENTICATION SCREENS
- **ChildSplashScreen** — Fun animated logo
- **ChildLoginScreen** — Simple email or parent-set PIN login
- **ChildWelcomeScreen** — "Hi [Name]! Ready for check-in?"

### HOME SCREEN
- **ChildHomeScreen** — Simplified dashboard
  - Big friendly greeting with child's name and avatar
  - "It's Check-In Day!" banner (when applicable)
  - Mood bubble (today's mood)
  - My Goals preview (top 2)
  - Recent badge/achievement
  - Parent's message (if left one)

### CHECK-IN SCREENS
- **ChildCheckInStartScreen** — "Let's check in! It takes about 15 minutes."
- **ChildCheckIn_Mood** — How are you feeling? (emoji scale 1-5)
  - Large emoji selector, pick one word
- **ChildCheckIn_School** — How's school going?
  - Subject-by-subject simple rating
  - Free text: "What was your favorite thing this week?"
- **ChildCheckIn_Friends** — How are your friendships?
  - Friend circle feeling scale
  - Did anything happen with friends this week?
- **ChildCheckIn_Confidence** — How do you feel about yourself?
  - Confidence slider
  - What are you proud of?
- **ChildCheckIn_Habits** — Routines and habits check
  - Sleep, eating, screen time — simple emoji ratings
- **ChildCheckIn_Challenges** — Anything bothering you?
  - Safe, open prompt
  - Option to mark as private (parent sees it's there but not content)
- **ChildCheckIn_Wins** — What was your biggest win this week?
  - Free text + emoji sticker
- **ChildCheckIn_Goals** — Review goals, set a new mini-goal
- **ChildCheckIn_Activity** — Pick a bonding activity with parent
- **ChildCheckInDoneScreen** — 🎉 "You did it!" celebration screen

### GOALS SCREENS
- **ChildGoalsScreen** — My goals board
  - Visual cards with progress bars
  - Active, completed, upcoming
- **ChildGoalDetailScreen** — Single goal detail + progress notes
- **ChildAddGoalScreen** — "I want to..." simple goal creation

### MOOD SCREENS
- **ChildMoodTodayScreen** — Quick mood log (standalone, not in check-in)
- **ChildMoodHistoryScreen** — My mood over time (simple chart)

---

## SHARED SCREENS
- **NotificationsScreen** — All in-app notifications (role-aware content)
- **ProfileScreen** — Own profile view and basic edit
- **BondingActivitiesScreen** — Activity library browser

---

## ONBOARDING FLOW (DETAILED)

```
App Launch
  └─ SplashScreen (2s)
      ├─ [Has Token] → Role Check → Parent Dashboard OR Child Home
      └─ [No Token] → WelcomeScreen
            ├─ [Login] → LoginScreen → Dashboard
            └─ [Sign Up] → RegisterScreen
                  └─ Onboarding Step 1 (Welcome)
                        └─ Step 2 (Parent Profile)
                              └─ Step 3 (Add Child)
                                    └─ Step 4 (Child Details)
                                          └─ Step 5 (Schedule)
                                                └─ Step 6 (Goals)
                                                      └─ Step 7 (Done)
                                                            └─ HomeScreen
```

---

## CHECK-IN FLOW (DETAILED)

```
CheckInsListScreen → [Start Check-In] → CheckInFlowScreen
  Step 1: Mood & Feelings
    Parent: How do you think your child is feeling this week?
    Child: How are you feeling? (emoji 1-5, one word)
  Step 2: School & Learning
    Child: Rate each subject (if applicable), highlight, struggle
    Parent: Any academic notes, upcoming tests
  Step 3: Friendships & Social
    Child: Friendship rating, notable events
    Parent: Observations about social life
  Step 4: Confidence & Self
    Child: Confidence scale, proud moment
    Parent: What strengths am I seeing?
  Step 5: Habits & Routines
    Child: Sleep, eating, screen time quick ratings
    Parent: Routines observations
  Step 6: Challenges & Worries
    Child: Free text, optional private flag
    Parent: What concerns do I have?
  Step 7: Wins & Proud Moments
    Child: Biggest win this week
    Parent: What am I celebrating about my child?
  Step 8: Goals Review
    Both: Review existing goals, mark progress
    Both: Set 1 new mini-goal for next week
  Step 9: Parent Reflection
    Parent only: Private note for self
  Step 10: Bonding Activity
    Both: Pick an activity from suggestions or add custom
  → Summary Generated
  → Summary Screen (both view)
  → Check-In Saved
```

---

## GOAL TRACKING FLOW

```
GoalsListScreen
  └─ [Add Goal] → AddGoalScreen
      - Title, Category, Target Date, Priority
      └─ GoalDetailScreen
            - Progress bar, history log
            - [Update Progress] → ProgressUpdateModal
            - [Mark Complete] → CelebrationScreen
```

---

## NOTIFICATION FLOW

```
Push Notification Received
  ├─ [checkin_reminder] → Open CheckInsListScreen
  ├─ [checkin_completed] → Open CheckInDetailScreen
  ├─ [goal_due] → Open GoalDetailScreen
  ├─ [mood_alert] → Open ChildInsightsScreen with mood highlighted
  └─ [summary_ready] → Open ReportDetailScreen
```

---

## UX PRINCIPLES: PARENTS vs CHILDREN

### Parent UX Principles:
- **Data-rich but not overwhelming** — progressive disclosure of analytics
- **Quick access** — most actions reachable in 2 taps
- **Confidence** — clear confirmation states, no ambiguous actions
- **Trust** — transparent about what children can and cannot see
- **Efficiency** — designed for a parent with 3 minutes, not 30

### Child UX Principles (Ages 6–10):
- **Emoji-first** — visual selections over text wherever possible
- **Short flows** — no more than 3 questions per screen
- **Celebration-heavy** — animations, stars, and badges frequently
- **Big touch targets** — minimum 56px tap areas
- **Simple language** — grade 3-4 reading level
- **Bright, playful** — distinct from parent app aesthetically

### Child UX Principles (Ages 11–13):
- **Slightly more text** — more nuanced questions but still visual
- **More autonomy** — can add private notes
- **Identity-aware** — tone shifts to respect, not baby talk
- **Social framing** — questions use peer-appropriate language

### Child UX Principles (Ages 14–17):
- **Teen-appropriate** — clean, modern, not childish
- **More control** — can initiate their own check-in
- **Goal ownership** — teen sets their own goals with parent co-sign
- **Respect privacy** — clear labeling of what is and isn't shared
