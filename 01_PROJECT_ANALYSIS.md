# CafeCanvas — Project Analysis & Restart Strategy
> Generated: 2026-06-02 | Based on full codebase scan

---

## WHY THE PROJECT ISN'T WORKING — ROOT CAUSE ANALYSIS

After reviewing all 4 documents and the master system file, here are the **actual problems**:

### 🔴 CRITICAL: Architecture Fragmentation
The project has **too many stacks trying to do the same job**:
- Next.js 16 frontend (`/frontend`) — SaaS platform
- Express 5 backend (`/Backend-Software`) — REST API
- Electron 42 desktop (`/Backend-Software/Store-Admin/electron`) — Desktop wrapper
- Flutter 3.12 monorepo (`/cafecanva_flutter`) — 5 separate apps
- Next.js storefront (`/Backend-Software/Store-Admin/store-front`) — Customer menu

**The problem**: 5 tech stacks with no single source of truth. Supabase is being bypassed by an Express layer that reimplements auth, tenant scoping, and RLS — creating two competing data access patterns.

### 🔴 CRITICAL: Dual Data Access Anti-Pattern
- `frontend/` talks to Supabase directly
- `Backend-Software/Store-Admin/frontend/` talks to Express (`localhost:5000`) which then talks to Supabase
- The Flutter apps talk to Supabase directly
- This means **3 different auth flows** for the same data

### 🔴 CRITICAL: Missing Business Logic Implementation
The `routes.ts` files mount endpoints like `DashboardController.getSummary` but the controller files are **placeholder stubs**. The 40+ endpoints in Store-Admin are declared but not implemented.

### 🟡 HIGH: Environment Variable Chaos
- `.env` at root
- `.env.local` at root
- `.env.local` inside `Store-Admin/frontend/`
- `.env.local` inside `Store-Admin/store-front/`
- Supabase keys missing (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vs `NEXT_PUBLIC_SUPABASE_ANON_KEY` — two different variable names used)

### 🟡 HIGH: Flutter App Entry Points Are Stubs
All 5 `main.dart` files are comments, not actual code. No features are implemented.

### 🟡 HIGH: Electron + Next.js Config Mismatch
`electron-builder.json` references `frontend/out/**/*` but Next.js `next.config.js` doesn't set `output: 'export'` — static export will fail.

### 🟡 HIGH: TypeScript Module Resolution Conflict
`Backend-Software/tsconfig.json` sets `"module": "NodeNext"` but `app.ts` uses ES import syntax mixed with CommonJS — this breaks compilation.

---

## RESTART STRATEGY — WHAT TO KEEP, WHAT TO DISCARD

### ✅ KEEP (Strong Foundation)
- **Supabase schema** (22 tables, RLS policies, migrations) — solid
- **Drizzle schema** (`drizzle/schema.ts`) — well-structured
- **JWT auth hook** (`inject_tenant_claims`) — correct approach
- **UI Theme Bible** (52 themes with CSS tokens) — valuable
- **SaaS Blueprint** (page specs, component specs) — use as product spec
- **System Design doc** — use as API contract

### ❌ DISCARD (Rebuild From Scratch)
- Express backend as a separate layer — **use Supabase + Edge Functions only**
- Electron wrapper — **replace with Tauri or just PWA**
- Flutter monorepo — **build as React Native Expo OR web PWA first**
- Fragmented Next.js apps — **unify into ONE Next.js app**

### 🔄 REBUILD STRATEGY — SIMPLIFIED STACK

```
BEFORE (Broken):                    AFTER (Clean):
─────────────────────────────────   ──────────────────────────────────
frontend/ (Next.js SaaS)            /apps/web/ (Next.js 15 monorepo)
Backend-Software/                   ├── (app) = SaaS platform + auth
  Store-Admin/frontend/             ├── (store) = Tenant storefront
  Store-Admin/store-front/          └── (admin) = Store Admin dashboard
  src/ (Express 5)             →    
  electron/                         /supabase/
cafecanva_flutter/                  ├── functions/ (Edge Functions)
  5 apps + 4 packages               └── migrations/ (existing)

3 databases accessed 3 ways    →    1 database (Supabase) accessed 1 way
```

---

## NEW ARCHITECTURE DECISION

### Single Source of Truth: Supabase
- **Auth**: Supabase Auth (already has tenant claims hook)
- **Database**: Supabase Postgres (existing 22-table schema)
- **Realtime**: Supabase Realtime (order events → KDS)
- **Storage**: Supabase Storage (menu images, logos)
- **Edge Functions**: Replace Express with Supabase Edge Functions (Deno)
- **RLS**: Already implemented — use it!

### Single Frontend Monorepo: Next.js 15 (App Router)
```
/apps/cafecanvas/
├── app/
│   ├── (marketing)/        ← Landing page, pricing
│   ├── (auth)/             ← Login, register
│   ├── (superadmin)/       ← Platform management
│   ├── (admin)/            ← Tenant store admin dashboard
│   ├── (staff)/            ← Staff POS web app
│   ├── (kds)/              ← Kitchen display web app
│   └── [slug]/             ← Public tenant storefront
├── components/
├── lib/
│   ├── supabase/
│   └── utils/
└── middleware.ts            ← Route protection + tenant resolution
```

### Staff App: Progressive Web App (PWA)
Instead of Flutter, make the staff dashboard a PWA with:
- `next-pwa` for service worker + offline
- Responsive design for tablet
- `window.print()` for receipts
- WebUSB/BLE for thermal printer (optional)

---

## SPRINT PLAN — 6 SPRINTS TO MVP

### Sprint 1 (Week 1-2): Foundation
- [x] New Next.js 15 project with Turbopack
- [x] Connect Supabase (existing schema)
- [x] Supabase Auth with tenant claims hook
- [x] Middleware: route protection + tenant slug resolution
- [x] Super admin: create tenant + staff accounts

### Sprint 2 (Week 3-4): Tenant Admin Dashboard
- [ ] Dashboard overview (revenue, orders, top items)
- [ ] Menu management (categories, items, modifiers, images)
- [ ] Table management (floor plan)
- [ ] Settings (store info, tax, payment)

### Sprint 3 (Week 5-6): POS & Ordering
- [ ] Staff POS interface (table select → order → bill)
- [ ] Kitchen Display System (KDS) web app
- [ ] QR code generation per table
- [ ] Supabase Realtime (order → KDS live updates)

### Sprint 4 (Week 7-8): Tenant Storefront
- [ ] Public storefront (`[slug].cafecanvas.bar`)
- [ ] Digital menu with cart
- [ ] QR dine-in ordering flow
- [ ] Theme engine (52 CSS themes from Supabase Storage)

### Sprint 5 (Week 9-10): Payments & Notifications
- [ ] Razorpay integration (UPI, cards)
- [ ] Bill generation with GST (CGST/SGST)
- [ ] WhatsApp/SMS via MSG91
- [ ] Welcome popup + phone capture flow

### Sprint 6 (Week 11-12): Analytics & Polish
- [ ] Revenue analytics dashboard
- [ ] Customer CRM
- [ ] Marketing (discounts, coupons, campaigns)
- [ ] PWA setup for staff mobile
- [ ] Performance + SEO

---

## DOMAIN ARCHITECTURE

```
cafecanvas.bar/              ← Marketing homepage (static)
app.cafecanvas.bar/          ← Super Admin + Tenant Admin + Staff
[slug].cafecanvas.bar/       ← Public tenant storefront
link.cafecanvas.bar/         ← Download links (Firebase Hosting, keep as-is)
```

**Tenant URL resolution** in `middleware.ts`:
```typescript
// Extract slug from subdomain: "brewhouse.cafecanvas.bar" → "brewhouse"
const host = request.headers.get('host') || ''
const slug = host.split('.')[0]
// Fetch tenant from Supabase by slug → inject into request headers
```

---

## KEY DECISIONS (NON-NEGOTIABLE)

1. **One Supabase project** — not separate auth + database
2. **Supabase RLS is the security layer** — no Express middleware
3. **Edge Functions only** for server-side logic (bill generation, payment verification, notifications)
4. **Next.js App Router** — no Pages Router
5. **Tailwind CSS 4** — with CSS variables for theme tokens
6. **TypeScript strict mode** — no `any` allowed
7. **No Flutter in MVP** — PWA-first for staff app
8. **Razorpay only** — no Stripe, no other gateway
9. **Indian compliance** — GST, CGST/SGST, INR in paise
10. **Mobile-first** — all tenant storefronts must work on 375px screens
