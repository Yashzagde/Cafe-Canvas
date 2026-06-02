# PROJECT_STATUS.md — CafeCanvas Platform Sprint & Task Tracker

## SPRINT BOARD

### Sprint 1: Foundation (Weeks 1-2) — ✅ COMPLETED
*   Next.js 16 project structure initialized.
*   Supabase connection configured with schema, custom JWT hooks, and table seeding migrations.
*   Middleware route protection and tenant slug resolution implemented.
*   Super admin panel initialized.

### Sprint 2: Tenant Admin Dashboard (Weeks 3-4) — 🚀 IN PROGRESS
*   Interactive dashboard statistics and chart analytics.
*   Menu and catalog management (categories, items, modifier groups).
*   Floor plan table status tracking.
*   Advanced receipt preview and printing settings with GST compliance.

### Sprint 3: POS & Ordering (Weeks 5-6) — 📋 BACKLOG
### Sprint 4: Tenant Storefront (Weeks 7-8) — 📋 BACKLOG
### Sprint 5: Payments & Notifications (Weeks 9-10) — 📋 BACKLOG
### Sprint 6: Analytics & Polish (Weeks 11-12) — 📋 BACKLOG

---

## PROJECT BACKLOG & ACTIVE TASKS

### Task: S2-T1 — Menu & Category Configuration Interface
*   **Agent**: `frontend-agent`
*   **Epic**: Tenant Admin Dashboard
*   **Priority**: Must Have
*   **Estimate**: M (4h)
*   **User Story**:
    *   *As a Tenant Admin, I want to manage my menu categories and individual items so that my storefront displays a current, beautiful product selection.*
*   **Acceptance Criteria**:
    *   Given the admin dashboard menu management tab, when adding or editing a category, the changes are validated and saved instantly.
    *   Given an item card, clicking the status toggle correctly updates the availability state.
    *   Given an empty category filter, the system displays a clear "No items found" empty state.

### Task: S2-T2 — Multi-Tenant RLS Policy Hardening
*   **Agent**: `security-agent` & `db-agent`
*   **Epic**: Foundation Security
*   **Priority**: Must Have
*   **Estimate**: L (8h)
*   **User Story**:
    *   *As a Tenant Owner, I want my data to be strictly isolated from other tenants so that customer transaction details remain completely private.*
*   **Acceptance Criteria**:
    *   Given any API route or direct query, database operations are restricted to the tenant ID present in the JWT claims payload.
    *   Given custom views or tables, Row-Level Security (RLS) is enabled and enforces restrictions without bypassing query controls.

### Task: S2-T3 — Indian Receipt & Tax Generation Integration
*   **Agent**: `backend-agent`
*   **Epic**: Payments & Billing
*   **Priority**: Must Have
*   **Estimate**: M (4h)
*   **User Story**:
    *   *As a Branch Manager, I want to print physical bills that split CGST and SGST and sum service charges so that our cafe remains tax compliant.*
*   **Acceptance Criteria**:
    *   Given active order lists, the tax engine accurately splits CGST (2.5%) and SGST (2.5%) to equal the composite tax rate.
    *   Given receipt rendering inputs, numbers are kept as integer values in paise to prevent floating point inaccuracies.

---

## DEFINITION OF DONE (DoD)
*   [x] All TypeScript code compiles with strict mode settings and 0 errors.
*   [x] Automated tests cover core operations with Vitest.
*   [x] UI is completely responsive and audited at a minimum of `375px`.
*   [x] Security and RLS checks pass without vulnerabilities.
*   [x] Code is verified and documented inside the codebase.
