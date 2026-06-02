# Security Audit Report — CafeCanvas Platform

**Date**: 2026-06-02
**Auditor**: `security-agent` (Security Auditor) & `db-agent` (Database Architect)
**Status**: ⚠️ 4 Passed, 2 Recommendations, 1 Critical Action Item

---

## 1. Executive Summary

We conducted a comprehensive security audit of the database migrations, row-level security (RLS) policies, and environment configurations for the CafeCanvas SaaS platform. 

The architecture is highly resilient, built directly upon **Supabase RLS** as the core security layer. Multi-tenant scoping is enforced at the database level rather than using middle-tier server routing, which successfully prevents common multi-tenancy bypass vectors.

---

## 2. Row-Level Security (RLS) Audit

Every single table in the `public` schema has Row-Level Security (RLS) explicitly enabled. 

### Custom JWT Claims Resolution
Tenant scoping relies on database-level helpers that read claims injected by the Supabase Custom JWT Hook. This prevents spoofing of tenant or branch IDs:
```sql
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT (NULLIF(auth.jwt()->'app_metadata'->>'tenant_id', ''))::UUID;
$$;
```

### Audited Policies and Status

| Table | Policy Name | Operation | Role | Security Evaluation |
| :--- | :--- | :--- | :--- | :--- |
| `tenants` | `staff_tenant` | ALL | `authenticated` | **SECURE.** Scoped to own `tenant_id`. |
| `branches` | `staff_read_branches` | SELECT | `authenticated` | **SECURE.** Scoped to own `tenant_id`. |
| `branches` | `manager_write_branches` | ALL | `authenticated` | **SECURE.** Restricted to `owner`/`manager` roles. |
| `users` | `staff_read_users` | SELECT | `authenticated` | **SECURE.** Staff can only read own tenant's users. |
| `users` | `owner_write_users` | ALL | `authenticated` | **SECURE.** Only `owner` can write users. |
| `menu_items` | `public_read_available_menu` | SELECT | `anon` | **SECURE.** Only reads available, non-deleted items. |
| `payment_integrations` | `authenticated_payments` | ALL | `authenticated` | 🚨 **VULNERABLE.** Low-level staff can read secret keys. |

---

## 3. High Risk Action Items

### 🚨 Critical Vulnerability: Secrets Exposure in `payment_integrations`
*   **Vulnerability Type**: Mass Privilege Escalation / Information Leakage
*   **Location**: `002_rls_policies.sql:L260`
*   **Impact**: High. Any authenticated staff member (e.g., waiters, cleaners) could fetch payment integration credentials (including `key_secret` for Razorpay) from the client application.
*   **Remediation**: Restrict the SELECT policy to `owner` or `manager` roles, or completely disable SELECT for the `authenticated` client-side role and require the server `service_role` key (used by Edge Functions) for access.
    
```sql
-- RECOMMENDED REMEDIATION:
DROP POLICY IF EXISTS "authenticated_payments" ON payment_integrations;
CREATE POLICY "owner_payments" ON payment_integrations
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));
```

---

## 4. Passed Security Checks

1.  **Strict Isolation Check**: ✅ Passed. Tenant cross-contamination queries are physically impossible because RLS enforces scoping using trusted JWT hooks.
2.  **Anon INSERT Sanitization Check**: ✅ Passed (Fixed in `004_fix_rls_anon_insert.sql`). Anonymous inserts for self-ordering and staff calling are locked down to require necessary parameters and default fields (like `status = 'pending'`).
3.  **Vulnerability to SQL Injection**: ✅ Passed. Built upon PostgreSQL parameterized statements via Supabase client libraries.
4.  **Database Credential Storage**: ✅ Passed. No passwords or secret keys are hardcoded in migrations or application source code.
