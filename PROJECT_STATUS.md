# PROJECT_STATUS.md — CafeCanvas Platform Sprint & Task Tracker

## SPRINT BOARD

### Sprint 1: Foundation (Weeks 1-2) — ✅ COMPLETED
*   Next.js 16 project structure initialized.
*   Supabase connection configured with schema, custom JWT hooks, and table seeding migrations.
*   Middleware route protection and tenant slug resolution implemented.
*   Super admin panel initialized.

### Sprint 2: Tenant Admin Dashboard (Weeks 3-4) — ✅ COMPLETED

#### Security & Foundation
- [x] **S2-T1** — Fix RLS Security Vulnerability (payment secrets) — db-agent — **CRITICAL**
  - Migration: `/supabase/migrations/010_fix_payment_secrets_rls.sql` (COMPLETED & RLS verified)
  - Status: Implemented and ready for production deployment

#### Menu Management
- [x] **S2-T2** — Menu Category Management UI + Server Actions — frontend-agent + backend-agent
  - Components: `MenuCategoryForm.tsx`, `CategoryList.tsx` (Completed)
  - Server Actions: Create/Update/Delete/Reorder categories (Completed)

- [x] **S2-T3** — Menu Item CRUD with Image Upload — backend-agent + frontend-agent
  - Components: `MenuItemForm.tsx`, `MenuItemGrid.tsx` (Completed)
  - Server Actions: CRUD items + bulk toggle + CSV import (Completed)

- [x] **S2-T4** — Modifier Groups & Options — backend-agent + frontend-agent
  - Components: `ModifierGroupForm.tsx`, `ModifierSelector.tsx` (Completed via MenuEditor)
  - Server Actions: Create/assign/reorder modifiers (Completed)

- [x] **S2-T5** — Menu Visibility & Availability Toggle — frontend-agent + backend-agent
  - Components: `MenuAvailabilityToggle.tsx`, bulk actions (Completed)
  - Realtime sync via Supabase subscriptions (Completed)

#### Testing & Deployment
- [x] **S2-T6** — E2E Tests for Menu Flows — qa-agent
  - Tests: category CRUD, item upload, modifier groups, availability toggle, RLS security (Vitest & strict tsc type check verified)

- [x] **S2-T7** — CI/CD Setup (GitHub Actions + Vercel) — devops-agent
  - Config: vercel rewrites and deployment files verified

#### Documentation
- [x] **S2-T8** — Implementation Guides — docs-agent
  - Guides: walkthrough and architectural blueprints created

### Sprint 3: POS & Ordering (Weeks 5-6) — ✅ COMPLETED
*   Database migrations `019_staff_auth_extensions` through `025_staff_activity_feed` successfully applied.
*   Scaffolded and implemented the `staff_web_app` PWA in the Flutter monorepo (Auth, PIN, Clock-In, Tables, Menu, and Activity).
*   Resolved duplicate typescript definitions and missing fields (attendance/bills) in `frontend/src/types/database.ts` ensuring clean compilation.
*   All Next.js frontend pages and server actions fully typed and tested via strict `type-check`.

### Sprint 4: Tenant Storefront (Weeks 7-8) — ✅ COMPLETED
*   Delivered the complete, conversion-optimized 15-section CafeCanvas V4 Enterprise SaaS Homepage.
*   Implemented a premium, luxury hospitality styling system using warm cream (#FAF7F2), warm amber, rich gold, and soft rose accents.
*   Wired dynamic live-update previews for cashiers, tables, inventories, and paise-precision CGST + SGST tax splits.
*   Integrated a live English / Hindi language toggle (i18n) with comprehensive dictionaries.
*   Removed scrollbar constraints from the pricing plans feature cards.
*   Successfully built and deployed live to production at https://cafecanvas.bar.
### Sprint 5: Payments & Notifications (Weeks 9-10) — 📋 BACKLOG
### Sprint 6: Analytics & Polish (Weeks 11-12) — 📋 BACKLOG

---

## PROJECT BACKLOG & ACTIVE TASKS

### CRITICAL ACTION ITEMS (Blocking Everything)

#### ⚠️ S2-T1: Fix RLS Security Vulnerability
**Status**: Migration file created (`010_fix_payment_secrets_rls.sql`)  
**Issue**: `payment_integrations` table exposed Razorpay secrets to all staff roles  
**Fix Applied**: 
- DROP vulnerable `"authenticated_payments"` policy
- CREATE role-based policies (owner/manager read-only)
- CREATE service_role full access (for Edge Functions)
- BLOCK anonymous access

**Next Steps**:
1. ✅ Migration file created
2. ✅ Deployed to Supabase and schemas updated
3. ✅ Run qa-agent verification tests (Vitest suite passed)
4. ✅ security-agent sign-off (Zero vulnerabilities detected)

---

### Sprint 2 Detailed Task Breakdown

#### Task: S2-T2 — Menu Category Management UI + Server Actions
*   **Agent**: `frontend-agent` & `backend-agent`
*   **Files Generated**:
    - Server Action: `/frontend/src/app/actions/menu-categories.ts` (create, update, delete, reorder)
    - Component: `/frontend/src/components/admin/MenuCategoryForm.tsx` (form)
    - Component: `/frontend/src/components/admin/CategoryList.tsx` (list view)
*   **Acceptance Criteria**:
    *   Given the admin dashboard menu management tab, when adding or editing a category, the changes are validated and saved instantly.
    *   Given an item card, clicking the status toggle correctly updates the availability state.
    *   Given an empty category filter, the system displays a clear "No items found" empty state.
*   **Tests Required**: `/tests/e2e/admin-menu-categories.spec.ts`

#### Task: S2-T3 — Menu Item CRUD with Image Upload
*   **Agent**: `backend-agent` & `frontend-agent`
*   **Files Generated**:
    - Server Action: `/frontend/src/app/actions/menu-items.ts` (CRUD + bulk + CSV)
    - Component: `/frontend/src/components/admin/MenuItemForm.tsx` (form + uploader)
    - Component: `/frontend/src/components/admin/MenuItemGrid.tsx` (grid view)
*   **Acceptance Criteria**:
    *   Given an item upload, image is automatically resized (max 1200px) and compressed.
    *   Given item prices in paise, storefront displays formatted INR (₹XX.XX).
    *   Given CSV import, bulk items are created with validation (rollback on error).
*   **Tests Required**: `/tests/e2e/admin-menu-items.spec.ts`

#### Task: S2-T4 — Modifier Groups & Options Management
*   **Agent**: `backend-agent` & `frontend-agent`
*   **Files Generated**:
    - Server Action: `/frontend/src/app/actions/modifiers.ts` (groups + options CRUD)
    - Component: `/frontend/src/components/admin/ModifierGroupForm.tsx` (manager)
    - Component: `/frontend/src/components/storefront/ModifierSelector.tsx` (customer-facing)
*   **Acceptance Criteria**:
    *   Given modifier group with options, admin can assign to multiple items.
    *   Given multi-select modifier, customer order total recalculates on selection.
    *   Given modifier deletion, existing orders are not affected.
*   **Tests Required**: `/tests/e2e/admin-modifiers.spec.ts`

#### Task: S2-T5 — Menu Visibility & Availability Toggle
*   **Agent**: `frontend-agent` & `backend-agent`
*   **Files Generated**:
    - Component: `/frontend/src/components/admin/MenuAvailabilityToggle.tsx` (toggle)
    - Server Action: Toggle + bulk availability updates
*   **Acceptance Criteria**:
    *   Given item availability toggle, storefront updates live via Realtime.
    *   Given bulk action on 5 items, all change instantly with toast confirmation.
    *   Given category hide, no items from that category appear on storefront.
*   **Tests Required**: `/tests/e2e/menu-availability.spec.ts`

---

## DEFINITION OF DONE (DoD)
*   [x] All TypeScript code compiles with strict mode settings and 0 errors.
*   [x] Automated tests cover core operations with Vitest.
*   [x] UI is completely responsive and audited at a minimum of `375px`.
*   [x] Security and RLS checks pass without vulnerabilities.
*   [x] Code is verified and documented inside the codebase.
