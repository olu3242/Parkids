# PAR-KIDS — Technical Architecture
**Version:** 1.0 | **Focus:** Startup Speed + Long-Term Scalability

---

## RECOMMENDED STACK OVERVIEW

| Layer | Technology | Justification |
|---|---|---|
| Web Frontend | Next.js 14 (App Router) | SSR/SSG, SEO, production-ready, TypeScript-first |
| Mobile | React Native + Expo SDK 51 | Code reuse with web, fast iteration, OTA updates |
| Backend | Supabase | All-in-one: DB, Auth, Storage, Edge Functions, Realtime |
| Database | PostgreSQL (via Supabase) | Relational, scalable, RLS support |
| Auth | Supabase Auth | Email, Google, Apple, PKCE flows, JWT |
| File Storage | Supabase Storage | S3-compatible, avatar and report storage |
| Push Notifications | Expo Notifications + Supabase Edge Functions | Cross-platform push via Expo, triggered server-side |
| Email | Resend.com | Modern email API, React Email templates |
| AI / Prompts | OpenAI GPT-4o via Edge Functions | Conversation coaching, summary generation |
| Analytics | PostHog (self-hostable) | Product analytics, funnel analysis, session recording |
| Error Monitoring | Sentry | React Native + Next.js SDKs |
| Payments | Stripe | Subscription billing, free trial management |
| Deployment (Web) | Vercel | Zero-config Next.js, edge CDN, env management |
| Deployment (Mobile) | Expo EAS Build + Submit | OTA updates, TestFlight/Play Store pipelines |
| Admin Tooling | Supabase Studio + Custom Next.js admin | Database management + lightweight admin panel |
| Monorepo | Turborepo | Fast parallel builds, shared packages |
| Package Manager | pnpm | Speed, disk efficiency |

---

## ARCHITECTURE DIAGRAM (Text Representation)

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTS                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  Next.js    │  │  React      │  │  Admin      ││
│  │  Web App    │  │  Native App │  │  Panel      ││
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘│
└─────────┼────────────────┼────────────────┼────────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Supabase   │
                    │  (BaaS)     │
                    ├─────────────┤
                    │  Auth       │
                    │  PostgreSQL │
                    │  Storage    │
                    │  Realtime   │
                    │  Edge Fns   │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼───┐    ┌───────▼──┐    ┌───────▼──┐
   │ OpenAI   │    │  Resend  │    │  Stripe  │
   │ GPT-4o   │    │  Email   │    │ Payments │
   └──────────┘    └──────────┘    └──────────┘
```

---

## BACKEND ARCHITECTURE (Supabase)

### Edge Functions (Serverless)
Located at `/supabase/functions/`

| Function | Trigger | Purpose |
|---|---|---|
| `generate-summary` | HTTP POST | Generate AI check-in summary via OpenAI |
| `send-reminder` | Cron (scheduled) | Send push + email reminders |
| `send-notification` | DB webhook | Trigger push on notification insert |
| `generate-report` | HTTP POST | Generate monthly PDF summary report |
| `mood-alert-check` | Cron (daily) | Check for low mood patterns, create alerts |
| `stripe-webhook` | HTTP POST | Handle Stripe subscription events |
| `invite-co-parent` | HTTP POST | Send co-parent invite email |

### Database RLS Policies
- All tables use PostgreSQL Row Level Security
- Parents can only access data for children in their household
- Children can only access their own data
- Co-parents access scoped by `parent_child_relationships.access_level`
- Audit logs are append-only, not RLS-restricted for admin

### Realtime Subscriptions
- Notifications table → push updates to notification bell
- Check-in status changes → update parent when child completes their portion
- Goal progress updates → live sync between parent and child

---

## API DESIGN GUIDANCE

### Convention
- RESTful via Supabase PostgREST (auto-generated from schema)
- Custom Edge Functions for business logic endpoints
- All responses follow: `{ data, error, meta }` envelope

### Key API Routes (Edge Functions + PostgREST)

```
POST /functions/v1/generate-summary
POST /functions/v1/generate-report
POST /functions/v1/invite-co-parent
POST /functions/v1/stripe-webhook
GET  /rest/v1/check_ins?child_user_id=eq.{id}&order=scheduled_at.desc
GET  /rest/v1/goals?child_user_id=eq.{id}&status=eq.active
GET  /rest/v1/moods?child_user_id=eq.{id}&order=logged_at.desc&limit=30
POST /rest/v1/check_ins
PATCH /rest/v1/check_ins?id=eq.{id}
POST /rest/v1/check_in_responses
GET  /rest/v1/summary_reports?child_user_id=eq.{id}
```

---

## SECURITY RECOMMENDATIONS

1. **Row Level Security** — Enabled on all tables; never bypass with service key on client
2. **PKCE Auth Flow** — Use for all OAuth flows (Google, Apple) on mobile
3. **JWT Expiry** — Short-lived access tokens (1hr), refresh token rotation enabled
4. **Child Account Gating** — Child accounts require parent session token to be created
5. **No Child PII to Third Parties** — OpenAI prompts strip child names/identifying info
6. **Stripe Webhooks** — Verified with Stripe signature header before processing
7. **Content Security Policy** — Strict CSP headers on Next.js web app
8. **Input Sanitization** — All user text inputs sanitized before storage
9. **Rate Limiting** — Supabase rate limits + custom limits on Edge Functions
10. **Audit Logging** — All CRUD on sensitive entities logged to audit_logs table

---

## DEPLOYMENT ARCHITECTURE

### Web (Vercel)
- Production branch: `main`
- Preview deployments on all PRs
- Environment variables managed in Vercel dashboard
- Edge middleware for auth checks
- ISR (Incremental Static Regeneration) for report pages

### Mobile (Expo EAS)
- EAS Build for iOS and Android production builds
- OTA updates via Expo Updates for JS-only changes
- TestFlight (iOS) + Internal Track (Android) for beta
- Staged rollouts for production releases

### Database (Supabase)
- Supabase Pro tier for production
- Daily automated backups
- Point-in-time recovery enabled
- Connection pooling via Supabase pgBouncer

---

## AI / INTELLIGENT PROMPT ENGINE

### Phase 1: Curated Prompt Library
- 200+ curated check-in questions organized by age group and section
- Stored in `check_in_templates.sections` JSONB
- No AI required at MVP

### Phase 2: AI-Enhanced Features
- **Summary Generation:** After check-in, Edge Function calls OpenAI with sanitized responses → generates warm summary paragraph
- **Smart Follow-ups:** Based on a child's response, AI suggests 1-2 follow-up questions for the parent
- **Monthly Report Narrative:** AI generates a 3-paragraph monthly narrative from aggregated data
- **Conversation Coaching:** Real-time suggestions during check-in (premium feature)

### OpenAI Integration Notes
- Model: `gpt-4o` for quality
- Temperature: 0.4 (consistent, not too creative)
- System prompt includes: role context, tone guide, age group, privacy constraints
- Child names replaced with generic references in API calls
- Response cached where possible to reduce API costs
