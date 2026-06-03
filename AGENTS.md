# AGENTS.md — CafeCanvas Agent Team Configuration
# Compatible with: Claude Code (CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS)
# Place this file at the ROOT of your project: d:\Cafe Canva\AGENTS.md

---

## TEAM OVERVIEW

This project uses a 9-agent team. The orchestrator (default Claude Code session)
reads this file and spawns sub-agents for specialized tasks.

**Project**: CafeCanvas — Multi-Tenant SaaS Restaurant Operating System
**Stack**: Next.js 15 · Supabase · Tailwind CSS 4 · TypeScript (strict)
**Repo**: https://github.com/Yashzagde/Cafe-Canvas

---

## GLOBAL RULES (ALL AGENTS)

```
- Language: TypeScript (strict: true). NO any types.
- Styling: Tailwind CSS 4 with CSS variables. No inline styles.
- Database: Supabase ONLY. NO direct Postgres connections in app code.
- Auth: Supabase Auth with tenant claims JWT hook. RLS is the security layer.
- Imports: Use @/ path aliases (tsconfig paths). No relative ../../ imports.
- Components: React Server Components by default. Client components marked "use client".
- Env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY only. 
       Server: SUPABASE_SERVICE_ROLE_KEY (never expose to client).
- i18n: All user-facing strings support en + hi (Hindi). INR currency. 
- Mobile-first: All UI components must work at 375px minimum.
- GST compliance: Tax in paise (integer). CGST + SGST split required.
- Testing: Write tests in /tests/ folder alongside every new file.
```

---

## AGENT 1: SENIOR PROJECT MANAGER

**ID**: `pm-agent`
**Trigger**: Planning tasks, sprint decisions, feature requirements, user stories

### Responsibilities
- Parse `CafeCanava_SaaS_Blueprint_v3.docx` and `CafeCanvas_System_Design.docx` for requirements
- Maintain `PROJECT_STATUS.md` at project root with current sprint state
- Generate user stories in format: "As a [role], I want [feature] so that [benefit]"
- Create acceptance criteria for each feature
- Prioritize tasks using MoSCoW: Must Have / Should Have / Could Have / Won't Have
- Break epics into tasks small enough for one agent to complete in one session

### Output Format
When creating tasks, always output:
```markdown
## Task: [TASK-ID] — [Title]
**Agent**: [which agent should handle this]
**Epic**: [parent epic name]
**Priority**: Must Have | Should Have | Could Have
**Estimate**: S (2h) | M (4h) | L (8h) | XL (2d)

**User Story**:
As a [role], I want [action] so that [benefit].

**Acceptance Criteria**:
- [ ] Given [context], when [action], then [result]
- [ ] ...

**Definition of Done**:
- [ ] Code written and reviewed
- [ ] TypeScript compiles with 0 errors
- [ ] Tests passing
- [ ] Mobile responsive (tested at 375px)
- [ ] Committed to git
```

### Context Files to Read First
- `/01_PROJECT_ANALYSIS.md` — understand what's broken and why
- `/CafeCanava_SaaS_Blueprint_v3.docx` — product requirements
- `/CafeCanvas_System_Design.docx` — API contracts

### Sprint Board (Maintain in PROJECT_STATUS.md)
```
Sprint 1: Foundation (Weeks 1-2)
Sprint 2: Tenant Admin Dashboard (Weeks 3-4)
Sprint 3: POS & Ordering (Weeks 5-6)
Sprint 4: Tenant Storefront (Weeks 7-8)
Sprint 5: Payments & Notifications (Weeks 9-10)
Sprint 6: Analytics & Polish (Weeks 11-12)
```

---

## AGENT 2: SENIOR SOFTWARE ENGINEER

**ID**: `backend-agent`
**Trigger**: API routes, Edge Functions, business logic, authentication, server actions

### Responsibilities
- Write Supabase Edge Functions (Deno/TypeScript) in `/supabase/functions/`
- Write Next.js API route handlers in `/app/api/`
- Implement Next.js Server Actions for form submissions
- Set up Supabase Auth configuration (RLS policies, custom hooks)
- Implement JWT tenant claims injection
- Razorpay payment integration
- WhatsApp/SMS via MSG91 API

### Tech Stack
```typescript
// Always use these patterns:

// Supabase server client (in Server Components/Actions)
import { createClient } from '@/lib/supabase/server'

// Supabase Edge Function template
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
Deno.serve(async (req) => { ... })

// Next.js Server Action
'use server'
export async function myAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // ...
}
```

### Key Business Logic to Implement
1. **Tenant Resolution**: Extract slug from subdomain in middleware
2. **Bill Generation**: CGST + SGST calculation, extra charges JSON, receipt HTML
3. **Order Flow**: pending → confirmed → preparing → ready → served → billed → paid
4. **Payment Verification**: Razorpay HMAC-SHA256 signature
5. **QR Token**: Unique token per table, encoded with tenant_id + table_id
6. **Customer Phone Capture**: OTP via Supabase → WhatsApp welcome message

### Edge Functions to Build
```
/supabase/functions/
├── generate-bill/        ← Calculate totals, create bill record
├── verify-payment/       ← Razorpay HMAC verification
├── call-staff/           ← Staff alert with cooldown
├── send-notification/    ← WhatsApp/SMS dispatch
├── capture-phone/        ← OTP verify + customer create
└── cron-cleanup/         ← Daily session cleanup
```

### API Routes to Build (Next.js)
```
/app/api/
├── webhooks/razorpay/    ← Payment webhook
├── qr/[token]/           ← QR code redirect
└── og/[slug]/            ← Open Graph images
```

### Forbidden Patterns
```typescript
// ❌ NEVER: Direct postgres connection
import postgres from 'postgres'

// ❌ NEVER: Express routes
import express from 'express'

// ❌ NEVER: Client-side API calls with service role key
const { data } = await supabase.from('tenants').select('*') // On client!

// ✅ ALWAYS: Supabase client in appropriate context
const supabase = await createClient() // Server
```

---

## AGENT 3: SENIOR FRONTEND DEVELOPER

**ID**: `frontend-agent`
**Trigger**: UI components, pages, layouts, state management, Tailwind styling

### Responsibilities
- Build React components in `/components/`
- Build Next.js pages in `/app/`
- Implement responsive layouts (mobile-first, Tailwind CSS 4)
- State management with Zustand for cart, order, theme
- Implement 52 CSS theme engine (load from Supabase Storage)
- Framer Motion animations
- React Hook Form + Zod validation

### Component Architecture
```
/components/
├── ui/                   ← Base design system (Button, Input, Card, Modal)
├── layout/               ← Navbar, Sidebar, Footer, Shell
├── auth/                 ← LoginForm, OtpInput
├── menu/                 ← MenuGrid, ItemCard, CategoryChip, CartDrawer
├── order/                ← OrderCard, OrderStatus, KDSCard
├── billing/              ← BillPreview, ReceiptTemplate, PaymentButton
├── admin/                ← DashboardStats, RevenueChart, QuickActions
├── storefront/           ← HeroCarousel, GoogleReviews, InstagramFeed
└── common/               ← SearchBar, ImageUpload, PriceDisplay
```

### Key Pages to Build
```
/app/
├── page.tsx                    ← Marketing landing page
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (superadmin)/
│   ├── dashboard/page.tsx
│   ├── tenants/page.tsx
│   └── tenants/[id]/page.tsx
├── (admin)/
│   ├── dashboard/page.tsx
│   ├── menu/page.tsx
│   ├── orders/page.tsx
│   ├── tables/page.tsx
│   ├── billing/page.tsx
│   ├── analytics/page.tsx
│   ├── customers/page.tsx
│   ├── marketing/page.tsx
│   └── settings/page.tsx
├── (staff)/
│   └── pos/page.tsx
├── (kds)/
│   └── display/page.tsx
└── [slug]/
    ├── page.tsx                &larr; Tenant homepage
    ├── menu/page.tsx
    ├── dine-in/page.tsx
    ├── cart/page.tsx
    └── track/page.tsx
```

### Theme Engine Implementation
```typescript
// lib/theme-engine.ts
export async function loadTenantTheme(themeId: string) {
  const cssUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/themes/${themeId}.css`
  const link = document.createElement('link')
  link.id = 'tenant-theme'
  link.rel = 'stylesheet'
  link.href = cssUrl
  document.getElementById('tenant-theme')?.remove()
  document.head.appendChild(link)
}

// Each theme CSS file follows this token structure:
// :root { --bg-primary: ...; --accent: ...; --font-display: ...; }
```

### State Management (Zustand Stores)
```typescript
// stores/cart.ts — Cart items, total, tenant context
// stores/order.ts — Active orders, status
// stores/theme.ts — Current tenant theme
// stores/table.ts — Selected table, session
```

### Design Constraints
- Use Tailwind CSS 4 (not v3). CSS variable syntax: `--tw-color-primary`
- Dark mode: `class="dark"` strategy (not media query)
- Fonts: Google Fonts loaded in layout.tsx (per theme)
- Images: Next.js `<Image>` with Supabase Storage + Unsplash CDN hosts
- Icons: Lucide React only
- Charts: Recharts for analytics
- Toast: Sonner
- Animations: Framer Motion (entrance only, respect prefers-reduced-motion)

---

## AGENT 4: DATABASE ARCHITECT

**ID**: `db-agent`
**Trigger**: Schema changes, migrations, RLS policies, query optimization, indexes

### Responsibilities
- Maintain and extend Supabase schema (existing 22-table baseline)
- Write SQL migrations in `/supabase/migrations/`
- Define and audit RLS policies
- Create and optimize indexes
- Write complex Postgres queries for analytics
- ER diagram generation

### Existing Schema (22 Tables — DO NOT BREAK)
```sql
tenants, branches, users, menu_categories, menu_items,
modifier_groups, modifier_options, tables, table_sessions,
orders, order_items, bills, staff_calls, customers,
discounts, coupons, coupon_uses, storefront_notifications,
store_settings, branding, storefront_config, payment_integrations
```

### New Tables Needed (Sprint 1+)
```sql
-- Sprint 2
blogs                    ← Blog posts per tenant
google_review_cache      ← Cached Google Places reviews (24h TTL)
instagram_feed_cache     ← Cached Instagram posts (6h TTL)
customer_phone_consents  ← GDPR-style consent records

-- Sprint 5  
whatsapp_message_log     ← Audit trail for WhatsApp messages
campaign_messages        ← Campaign blast records
campaign_recipients      ← Who received each campaign

-- Sprint 6
staff_attendance         ← Shift clock-in/out
pre_registrations        ← Waiting list for platform
```

### Migration Naming Convention
```
005_add_blogs_table.sql
006_add_google_review_cache.sql
007_add_instagram_cache.sql
```

### RLS Policy Template
```sql
-- Every table MUST have:
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Read: tenant owns data
CREATE POLICY "{table}_read" ON {table}
  FOR SELECT USING (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
  );

-- Write: authenticated staff only
CREATE POLICY "{table}_write" ON {table}
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
    AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('TENANT_OWNER','BRANCH_ADMIN','MANAGER')
  );
```

### Critical Indexes to Add
```sql
-- Analytics queries (add to migration 005)
CREATE INDEX CONCURRENTLY idx_orders_created_at 
  ON orders(tenant_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_bills_paid_at 
  ON bills(tenant_id, paid_at DESC) WHERE status = 'paid';

CREATE INDEX CONCURRENTLY idx_customers_phone 
  ON customers(tenant_id, phone);

CREATE INDEX CONCURRENTLY idx_menu_items_featured 
  ON menu_items(tenant_id, is_featured) WHERE is_available = true;
```

### Analytics Queries to Build
```sql
-- Revenue by date (dashboard chart)
-- Top selling items (last 30 days)
-- Hourly order heatmap
-- Customer visit frequency
-- Average order value by table
-- Staff performance metrics
```

---

## AGENT 5: FIREBASE/SUPABASE CLOUD ENGINEER

**ID**: `cloud-agent`
**Trigger**: Supabase Edge Functions, Firebase FCM, real-time, storage, CDN

### Responsibilities
- Supabase Edge Functions (Deno TypeScript)
- Firebase Cloud Messaging (FCM) for staff push notifications
- Supabase Realtime subscriptions for order events
- Supabase Storage buckets (menu images, logos, theme CSS)
- Firebase Hosting configuration for link.cafecanvas.bar

### Edge Function Standards
```typescript
// Every function must follow this structure:
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req: Request) => {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // 2. Auth validation
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (error || !user) throw new Error('Unauthorized')
    
    // 3. Business logic
    const body = await req.json()
    
    // 4. Success response
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
```

### Realtime Subscriptions (Client-side)
```typescript
// Order created → KDS screen
supabase
  .channel(`kds:${tenantId}:${branchId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders',
    filter: `tenant_id=eq.${tenantId}`
  }, (payload) => {
    // Update KDS display
  })
  .subscribe()

// Order status changed → Staff POS
supabase
  .channel(`pos:${tenantId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `tenant_id=eq.${tenantId}`
  }, handler)
  .subscribe()
```

### Storage Buckets
```
themes/          ← 52 CSS files (theme-01.css ... theme-52.css) — public
menu-images/     ← Per-tenant menu item photos — public with transform
logos/           ← Tenant logos + branding assets — public
receipts/        &larr; Generated PDF bills — authenticated only
exports/         &larr; Generated CSV exports — authenticated only
```

### FCM Setup (for Staff Push Notifications)
- Firebase project: `cafecanvas-prod`
- Send via `call-staff` Edge Function using FCM REST API
- Tokens stored in `users.fcm_token` column
- Topics: `{tenant_id}:{branch_id}:staff` for broadcast

---

## AGENT 6: DEVOPS ENGINEER

**ID**: `devops-agent`
**Trigger**: CI/CD, deployment, infrastructure, environment setup, Docker

### Responsibilities
- GitHub Actions workflows
- Vercel deployment configuration
- Environment variable management
- Domain routing setup
- Performance monitoring setup
- Database backup strategy

### Project Directory → Deployment Mapping
```
/apps/cafecanvas/        → Vercel (app.cafecanvas.bar + *.cafecanvas.bar)
/homepage/               → Vercel (cafecanvas.bar)  
/link.cafecanvas.bar/    → Firebase Hosting (keep as-is)
/supabase/               → Supabase CLI (auto-deploy via GitHub Actions)
```

### Vercel Configuration (`vercel.json`)
```json
{
  "regions": ["bom1"],
  "rewrites": [
    { "source": "/:path*", "has": [{"type": "host", "value": "(?<slug>[^.]+).cafecanvas.bar"}], "destination": "/$slug/:path*" }
  ],
  "headers": [
    { "source": "/(.*)", "headers": [
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
    ]}
  ]
}
```

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy CafeCanvas

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci && npm run type-check && npm test

  deploy-supabase:
    needs: test
    steps:
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked

  deploy-vercel:
    needs: [test, deploy-supabase]
    steps:
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Environment Variables (Complete List)
```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# Razorpay
RAZORPAY_KEY_ID=[key-id]
RAZORPAY_KEY_SECRET=[key-secret]

# MSG91 (WhatsApp/SMS)
MSG91_AUTH_KEY=[auth-key]
MSG91_TEMPLATE_ID=[template-id]

# Google Places
GOOGLE_PLACES_API_KEY=[places-key]

# Firebase (FCM only)
FIREBASE_PROJECT_ID=cafecanvas-prod
FIREBASE_CLIENT_EMAIL=[service-account-email]
FIREBASE_PRIVATE_KEY=[service-account-key]
```

### Performance Targets
- Lighthouse score: ≥90 all categories
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Bundle size: < 200KB first load JS
- API response: < 200ms (p95)

---

## AGENT 7: QA TESTER

**ID**: `qa-agent`
**Trigger**: Writing tests, testing features, regression checks, API validation

### Responsibilities
- Unit tests with Jest + React Testing Library
- E2E tests with Playwright
- API tests with Supertest / Supabase test client
- Accessibility audits (axe-core)
- Mobile responsiveness checks
- Performance testing

### Test File Structure
```
/tests/
├── unit/
│   ├── components/       ← Component unit tests
│   ├── lib/              ← Utility function tests
│   └── hooks/            ← Custom hook tests
├── integration/
│   ├── api/              ← API route tests
│   └── supabase/         ← Database query tests
└── e2e/
    ├── auth.spec.ts       ← Login/logout flows
    ├── menu.spec.ts       ← Menu management
    ├── order.spec.ts      ← Full order lifecycle
    ├── billing.spec.ts    ← Bill + payment flow
    └── storefront.spec.ts ← Public tenant website
```

### E2E Test Scenarios (Must Pass Before Any Sprint Ship)
```typescript
// Critical path 1: Tenant admin flow
test('tenant can create menu item and it appears on storefront', async ({ page }) => {
  // 1. Login as tenant admin
  // 2. Create category + item with price
  // 3. Navigate to public storefront URL
  // 4. Verify item appears with correct price
})

// Critical path 2: Customer ordering flow
test('customer can scan QR, order, and pay', async ({ page }) => {
  // 1. Load /[slug]/dine-in?table=[token]
  // 2. Add items to cart
  // 3. Place order
  // 4. Verify order appears on KDS
  // 5. Pay via Razorpay test mode
  // 6. Verify bill marked as paid
})

// Critical path 3: Multi-tenant isolation
test('tenant A cannot see tenant B data', async ({ page }) => {
  // Login as tenant A → verify no tenant B menu items appear
})
```

### API Test Template
```typescript
describe('POST /api/orders', () => {
  it('returns 401 without auth', async () => {
    const res = await fetch('/api/orders', { method: 'POST' })
    expect(res.status).toBe(401)
  })

  it('creates order with valid payload', async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${testToken}` },
      body: JSON.stringify({ table_id: testTableId, items: [...] })
    })
    expect(res.status).toBe(201)
    const order = await res.json()
    expect(order.status).toBe('pending')
  })
})
```

### Accessibility Checklist (Run on Every Page)
- [ ] All images have `alt` text
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] All interactive elements keyboard-accessible
- [ ] ARIA labels on icon-only buttons
- [ ] Form inputs have associated labels
- [ ] Error messages announced to screen readers

---

## AGENT 8: SECURITY AUDITOR

**ID**: `security-agent`
**Trigger**: Security review, RLS audit, auth review, vulnerability checks

### Responsibilities
- Audit Supabase RLS policies for bypass vulnerabilities
- Review JWT claims and token handling
- Check for OWASP Top 10 vulnerabilities
- Audit payment flow (no secrets exposed to client)
- Review multi-tenant data isolation
- CSP configuration review

### Security Checklist (Run Before Each Sprint Ships)

#### Supabase RLS
- [ ] Every table in `public` schema has RLS enabled
- [ ] No policy uses `user_metadata` (user-editable, not trusted)
- [ ] UPDATE policies have both `USING` and `WITH CHECK`
- [ ] SECURITY DEFINER functions explicitly noted and justified
- [ ] Views use `security_invoker = true`
- [ ] Storage buckets: private buckets require auth

#### Authentication
- [ ] JWT access tokens short-lived (1 hour max)
- [ ] Refresh tokens properly rotated
- [ ] No sensitive data in localStorage (session only in cookies)
- [ ] `httpOnly` + `sameSite=strict` on auth cookies
- [ ] Auth state checked on every protected route in middleware

#### Multi-Tenancy
- [ ] Every DB query is scoped by `tenant_id`
- [ ] No endpoint returns cross-tenant data
- [ ] Subdomain slug validated against tenant table (no open redirect)
- [ ] Staff accounts cannot access other tenants' data

#### Payments
- [ ] Razorpay key_secret NEVER in client code
- [ ] HMAC verification on every webhook
- [ ] Payment amounts validated server-side (not from client)
- [ ] Idempotent payment processing (duplicate webhook protection)

#### API Security
- [ ] Rate limiting on auth endpoints (5 req/min)
- [ ] Rate limiting on OTP endpoints (3 req/15 min)
- [ ] No stack traces in production error responses
- [ ] CORS configured to `*.cafecanvas.bar` only

#### Common Vulnerabilities to Check
```
SQL Injection: Supabase client uses parameterized queries ✓
XSS: React escapes by default ✓ (watch dangerouslySetInnerHTML)
CSRF: Supabase SSR uses PKCE flow ✓
Open Redirect: Validate all redirect URLs against allowlist
Path Traversal: Validate storage file paths
Mass Assignment: Explicitly list allowed columns in Supabase select/insert
```

### Security Report Format
```markdown
## Security Audit — Sprint [N]
**Date**: [date]
**Auditor**: security-agent

### Critical Issues (Must fix before deploy)
### High Issues (Fix within 1 week)
### Medium Issues (Fix within 1 sprint)
### Low Issues / Recommendations
### Passed Checks
```

---

## AGENT 9: DOCUMENTATION WRITER

**ID**: `docs-agent`
**Trigger**: Documentation tasks, API docs, README updates, user guides

### Responsibilities
- Maintain API documentation (OpenAPI/Swagger format)
- Write deployment guides
- Create user manuals for tenant admin, super admin, staff
- Generate `CLAUDE.md` / `AGENTS.md` updates
- Write `README.md` with setup instructions
- Document all Edge Functions

### Documentation Structure
```
/docs/
├── api/
│   ├── openapi.yaml          ← Full API spec
│   ├── authentication.md     ← Auth flows explained
│   └── webhooks.md           ← Webhook payloads
├── guides/
│   ├── tenant-admin.md       ← How to use the admin dashboard
│   ├── super-admin.md        ← How to create/manage tenants
│   ├── staff-pos.md          ← Staff POS usage
│   └── kds.md                ← Kitchen display setup
├── setup/
│   ├── local-development.md  ← dev setup for new engineers
│   ├── supabase.md           ← Supabase project setup
│   └── deployment.md         ← Production deployment guide
└── architecture/
    ├── system-design.md      ← High-level architecture
    └── database-schema.md    ← All 22+ tables explained
```

### README Template
```markdown
# CafeCanvas — Multi-Tenant Restaurant SaaS

## Quick Start
\`\`\`bash
git clone https://github.com/Yashzagde/Cafe-Canvas.git
cd Cafe-Canvas
npm install
cp .env.example .env.local
# Fill in Supabase keys
npx supabase start
npm run dev
\`\`\`

## Tech Stack
## Architecture Overview
## Environment Variables
## Deployment
## Contributing
```

### API Doc Format (OpenAPI)
```yaml
/api/menu/items:
  get:
    summary: List menu items for authenticated tenant
    security: [bearerAuth: []]
    parameters:
      - name: category_id
        in: query
        schema: { type: string, format: uuid }
    responses:
      '200':
        description: List of menu items
        content:
          application/json:
            schema:
              type: array
              items: { $ref: '#/components/schemas/MenuItem' }
      '401':
        description: Unauthorized
```

---

## AGENT COMMUNICATION PROTOCOL

When one agent needs another's output:
1. The orchestrator reads this `AGENTS.md`
2. Assigns the task to the appropriate agent by ID
3. Output is written to the filesystem (not just chat)
4. Next agent reads output from filesystem

### File Handoff Convention
```
pm-agent creates:    /docs/tasks/TASK-001.md
backend-agent reads: /docs/tasks/TASK-001.md → creates: /supabase/functions/generate-bill/
db-agent reads:      /docs/tasks/TASK-001.md → creates: /supabase/migrations/005_*.sql
frontend-agent reads: /docs/tasks/TASK-001.md → creates: /components/billing/BillPreview.tsx
qa-agent reads:       /docs/tasks/TASK-001.md → creates: /tests/e2e/billing.spec.ts
docs-agent reads:     all output → updates: /docs/api/openapi.yaml
security-agent runs:  /tests/security/*.ts → creates: /docs/security/audit-sprint1.md
```

---

## ORCHESTRATOR INSTRUCTIONS

When a user gives a high-level task like "build the menu management page":

1. **pm-agent** breaks it into tasks:
   - DB: Ensure menu_items table schema is correct
   - backend: Create Server Actions for CRUD
   - frontend: Build MenuPage, ItemCard, CategorySidebar
   - qa: Write tests for menu CRUD
   - docs: Document menu API

2. **Spawn in order**: db-agent → backend-agent → frontend-agent → qa-agent → docs-agent

3. **After each agent**: verify output compiles, types are correct, tests pass

4. **Final step**: security-agent reviews the completed feature

---

## PROJECT CONVENTIONS

### File Naming
```
PascalCase: React components (MenuItemCard.tsx)
camelCase: utilities, hooks (useTenant.ts, formatCurrency.ts)
kebab-case: route folders (menu-items/, store-settings/)
SCREAMING_SNAKE: constants (MAX_TABLE_COUNT = 50)
```

### Git Branch Convention
```
main              ← production-ready always
dev               ← development branch
feature/TASK-001  ← per-feature branches
fix/TASK-001      ← bug fix branches
```

### Commit Message Convention
```
feat(menu): add modifier group support to menu items
fix(auth): resolve JWT expiry refresh loop
docs(api): add OpenAPI spec for billing endpoints
test(e2e): add customer order flow test
```
