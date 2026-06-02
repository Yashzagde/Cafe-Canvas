# Supabase Configuration & Database Setup — CafeCanvas

This guide provides instructions for initializing and deploying the PostgreSQL database, Row-Level Security (RLS) policies, and Deno Edge Functions on the **Supabase** cloud backend.

---

## 1. Local Prerequisites & Supabase CLI

To manage migrations and Deno Edge Functions locally, install the **Supabase CLI**:
```bash
# Install via npm
npm install -g supabase

# Or via Windows PowerShell Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Login using your Supabase account token
supabase login
```

---

## 2. Running Schema Migrations

The migrations directory `/supabase/migrations/` contains the complete set of version-controlled SQL statements:
```bash
# Link your local CLI to your cloud Supabase project
supabase link --project-ref oeringgdbxmmihgvuyfa

# Push all migrations to the remote database
supabase db push
```

### Migration History:
1.  `001_schema.sql`: Core table structures (tenants, users, orders, tables, bills).
2.  `002_rls_policies.sql`: Strict Row-Level Security definitions.
3.  `003_seed_demo.sql`: Pre-populated catalog items and mock floor plans.
4.  `004_fix_rls_anon_insert.sql`: Hardened anonymous checkout and table session inserts.
5.  `005_blogs.sql` to `008_indexes.sql`: Search optimization and secondary caching tables.

---

## 3. JWT Claims Hook Setup

CafeCanvas uses database-level multi-tenancy. When a user authenticates, Supabase Auth runs a Custom JWT Hook that injects the user's `tenant_id`, `branch_id`, and `role` from the `users` table into the auth token.

### Trigger and Role Resolution:
Ensure the custom token generator hook is enabled in your Supabase Auth settings panel, pointing to the database resolver function:
```sql
-- Resolves user context from public.users table during token signing
CREATE OR REPLACE FUNCTION public.inject_tenant_claims(event jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  resolved_role TEXT;
  resolved_tenant UUID;
  resolved_branch UUID;
BEGIN
  -- Extract metadata
  SELECT role, tenant_id, branch_id 
  INTO resolved_role, resolved_tenant, resolved_branch
  FROM users 
  WHERE id = (event ->> 'user_id')::uuid;

  -- Return customized claim set
  RETURN jsonb_set(
    jsonb_set(
      jsonb_set(event, '{claims,app_metadata,role}', to_jsonb(resolved_role)),
      '{claims,app_metadata,tenant_id}', to_jsonb(resolved_tenant)
    ),
    '{claims,app_metadata,branch_id}', to_jsonb(resolved_branch)
  );
END;
$$;
```

---

## 4. Deno Edge Functions Deployment

Deploy your backend calculations and service triggers to Supabase Edge Functions:
```bash
# Deploy all functions at once
supabase functions deploy

# Or deploy individual functions
supabase functions deploy generate-bill
supabase functions deploy verify-payment
supabase functions deploy call-staff
```

### Environment Secrets Needed:
Add secret parameters to your Supabase dashboard environment:
*   `RAZORPAY_KEY_SECRET`: Private callback verification key.
*   `FIREBASE_PROJECT_ID` & `FIREBASE_SERVICE_ACCOUNT_TOKEN`: Staff notification dispatcher variables.
