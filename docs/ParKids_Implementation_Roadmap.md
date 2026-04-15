# PAR-KIDS — Implementation Roadmap
**Version:** 1.0 | **Total MVP Timeline:** ~20 Weeks

---

## PHASE 0: PRODUCT DEFINITION (Weeks 1–2)

### Objectives
- Finalize PRD with founder alignment
- Confirm tech stack decisions
- Establish design direction
- Set up team, tools, and repositories

### Main Deliverables
- ✅ Signed-off PRD
- ✅ Database schema reviewed
- ✅ Figma design system setup
- ✅ Monorepo initialized (Turborepo + pnpm)
- ✅ Supabase project created (dev + staging)
- ✅ GitHub repo with branch strategy (main, develop, feature/*)
- ✅ Notion/Linear project management setup
- ✅ Environment variables documented

### Dependencies
- Founder product decisions
- Domain purchased (parkids.com)
- Team identified (minimum: 1 FE, 1 BE/full-stack, 1 designer)

### Risks
- Scope creep from stakeholders
- Late design system decisions delaying development

### Exit Criteria
- All team members have environment running locally
- Supabase schema migrations committed
- Figma design system shared with dev team

---

## PHASE 1: DESIGN & PLANNING (Weeks 2–4)

### Objectives
- Design all MVP screens in Figma
- Create component library
- Prototype key flows for usability testing
- Finalize check-in template question sets

### Main Deliverables
- ✅ Figma: Parent web app (all screens)
- ✅ Figma: Parent mobile app (all screens)
- ✅ Figma: Child mobile app (all screens)
- ✅ Figma: Landing page
- ✅ Check-in question library (3 age groups × 10 sections)
- ✅ Component library: buttons, cards, forms, charts, modals
- ✅ Prototype: onboarding flow + check-in flow

### Dependencies
- Phase 0 complete
- Brand identity finalized (colors, fonts, logo)

### Risks
- Designer bottleneck slows engineering start
- Child UX requires multiple iterations

### Exit Criteria
- Figma designs approved by founder
- Child experience validated with at least 3 parents + children
- All developer handoff specs complete in Figma

---

## PHASE 2: MVP BACKEND (Weeks 3–7, parallel with design)

### Objectives
- Stand up Supabase infrastructure
- Implement all database tables and RLS policies
- Build all Edge Functions
- Set up auth flows
- Create seed data

### Main Deliverables
- ✅ All 23 database tables created with migrations
- ✅ RLS policies for parent and child roles
- ✅ Supabase Auth configured (email, Google, Apple)
- ✅ Edge Functions: generate-summary, send-reminder, mood-alert-check
- ✅ Check-in template seed data (all age groups)
- ✅ Bonding activity library seed data (50+ activities)
- ✅ API tested via Postman/Supabase Studio
- ✅ Stripe integration (basic subscription management)
- ✅ Resend email configured (welcome, reminder, summary emails)

### Dependencies
- Schema finalized in Phase 0
- OpenAI API key provisioned
- Stripe account created

### Risks
- RLS complexity causes bugs
- OpenAI rate limits in development

### Exit Criteria
- All API endpoints returning correct data with auth
- RLS verified: parent cannot access another family's data
- Edge Functions deployed to staging

---

## PHASE 3: WEB APP MVP (Weeks 6–12)

### Objectives
- Build Next.js web application for parent use
- Complete all core parent flows
- Integrate with Supabase backend

### Main Deliverables
- ✅ Authentication (login, register, forgot password)
- ✅ Onboarding flow (parent + child setup)
- ✅ Parent dashboard with child cards
- ✅ Child profile management
- ✅ Check-in flow (full guided engine)
- ✅ Check-in history and summaries
- ✅ Goal creation and tracking
- ✅ Mood and academic tracking
- ✅ Growth analytics (charts)
- ✅ Co-parent invite and management
- ✅ Settings and notification preferences
- ✅ Subscription management (Stripe)
- ✅ Landing page (marketing site)

### Dependencies
- Phase 2 backend stable
- Figma designs delivered

### Risks
- Chart library complexity
- PDF report generation time
- Cross-browser compatibility

### Exit Criteria
- All MVP screens functional
- E2E tests passing (Playwright)
- Deployed to Vercel staging with real Supabase data
- Lighthouse score > 85 (Performance, Accessibility)

---

## PHASE 4: MOBILE APP MVP (Weeks 8–15, parallel with web)

### Objectives
- Build React Native + Expo apps for parent and child
- Complete all mobile flows
- Configure push notifications

### Main Deliverables
- ✅ Authentication + onboarding (mobile)
- ✅ Parent home dashboard (mobile)
- ✅ Child selection and profiles (mobile)
- ✅ Check-in flow — both parent and child sides
- ✅ Child app (age-appropriate experience)
- ✅ Goal tracking screens
- ✅ Mood tracker
- ✅ Growth charts
- ✅ Push notifications (Expo)
- ✅ Settings screen
- ✅ App submitted to TestFlight + Google Play Internal
- ✅ Expo EAS build pipeline configured

### Dependencies
- Phase 2 backend stable
- Mobile designs from Phase 1
- Apple Developer Account + Google Play Console

### Risks
- iOS review rejection (child privacy policies)
- Expo SDK breaking changes
- Push notification delivery reliability

### Exit Criteria
- App running on real iOS and Android devices
- All check-in flows working end-to-end
- Push notifications delivered reliably
- 5 beta families completing full check-in on mobile

---

## PHASE 5: AI-GUIDED INTELLIGENCE LAYER (Weeks 14–18)

### Objectives
- Integrate OpenAI for summary generation
- Build intelligent prompt suggestions
- Add smart follow-up question engine

### Main Deliverables
- ✅ Check-in summary auto-generation (OpenAI GPT-4o)
- ✅ Monthly report narrative generation
- ✅ Smart follow-up question suggestions during check-in
- ✅ Mood pattern alert logic refined with AI scoring
- ✅ Age-aware question personalization
- ✅ Prompt quality reviewed by child development consultant

### Dependencies
- Phase 3 + 4 complete
- OpenAI production API key and billing
- Child development consultant engagement

### Risks
- AI output quality inconsistency
- Cost per summary at scale
- Bias or inappropriate suggestions for child age groups

### Exit Criteria
- 90%+ of generated summaries rated "good" by parent testers
- Cost per check-in summary < $0.05
- No inappropriate AI output in QA testing

---

## PHASE 6: GROWTH, ANALYTICS & SCALING (Weeks 18–24+)

### Objectives
- Launch publicly
- Set up product analytics
- Begin Phase 2 feature development
- Scale infrastructure

### Main Deliverables
- ✅ PostHog analytics fully instrumented
- ✅ App Store and Google Play public launch
- ✅ Marketing site live with SEO content
- ✅ Blog: parenting + development content
- ✅ Referral program scaffolded
- ✅ Customer support (Intercom or Crisp)
- ✅ Database query optimization
- ✅ Phase 2 scoping: chores, rewards, counselor portal

### Dependencies
- All Phase 1–5 exit criteria met
- Marketing budget available
- Support team or automated support configured

### Risks
- Low organic discoverability
- High churn if check-in completion rate < 50%
- App store algorithm changes

### Exit Criteria
- 1,000+ active households in first 4 weeks post-launch
- D30 retention > 40%
- NPS > 55
- < 1% crash rate on mobile
- Gross margin > 70%
