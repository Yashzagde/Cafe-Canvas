# Cafe Canva — Deploy Checklist

> Run this top-to-bottom before every production release. Each section is a gate: don't
> proceed to the next until all items in the current section are green.

---

## 0. Pre-flight — Before You Push

- [ ] All feature branches merged into `main` and CI is green
- [ ] No `.env*` files accidentally staged (`git status | grep .env` returns nothing)
- [ ] `npm run lint` passes in both `frontend/` and `store-front/`
- [ ] `npm run build` succeeds locally for both apps (catches type errors CI may miss)
- [ ] Supabase migration files committed under `supabase/migrations/` with sequential names
- [ ] `DEPLOY_CHECKLIST.md` reviewed for any new items added since last release
- [ ] `grep -r "NEXT_PUBLIC_DEMO_MODE=true" .env* 2>/dev/null` returns nothing (DEMO_MODE guard)

---

## 1. Database — Supabase Migrations

### 1a. Staging run first (always)
```bash
supabase db push --linked --dry-run   # preview SQL diff
supabase db push --linked             # apply to staging project
```
- [ ] Dry-run diff matches expected changes only
- [ ] No unexpected DROP TABLE or DROP COLUMN statements
- [ ] RLS policies present on every new table (`supabase inspect db rls`)

### 1b. Production push
```bash
# Point CLI at production project first
supabase link --project-ref <PROD_REF>
supabase db push --linked
```
- [ ] Migration applied without errors
- [ ] Row counts on `orders` / `customers` unchanged (sanity check)
- [ ] Verify new policies: anonymous inserts are blocked on `table_sessions`, `orders`, `order_items`, `staff_calls`, `customers`

### 1c. RLS quick-audit (run in Supabase SQL editor)
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = FALSE;
```
> **Expected:** zero rows. Any table returned here is an open door — block release.

### Rollback — Database
```bash
# Correct approach: Create a new forward migration that undoes the changes
supabase migration new rollback_<MIGRATION_VERSION>
# Write the inverse SQL in that file, then:
supabase db push --linked

# Nuclear: restore from point-in-time backup (Supabase dashboard → Backups)
# Downtime window: ~5 min. Notify tenants before triggering.
```

---

## 2. Environment Variables

### 2a. Vercel — SaaS Platform (`frontend/`)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Project URL from Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Publishable (anon) key — safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | **Never expose client-side.** Server only. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | `rzp_live_…` in production |
| `RAZORPAY_KEY_SECRET` | ✅ | Server only. Used in HMAC-SHA256 verify route. |
| `NEXT_PUBLIC_APP_URL` | ✅ | e.g. `https://app.cafecanva.com` |
| `NEXT_PUBLIC_DEMO_MODE` | ✅ | Must be `"false"` in production |

### 2b. Vercel — Storefront (`store-front/`)

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Same project as platform |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Same key, scoped by RLS |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | ✅ | Same key as platform |
| `NEXT_PUBLIC_STOREFRONT_BASE_URL` | ✅ | e.g. `https://order.cafecanva.com` |
| `NEXT_PUBLIC_PLATFORM_URL` | ✅ | Points back to the SaaS app |

### Gotchas
- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vs `NEXT_PUBLIC_SUPABASE_ANON_KEY`:** The rename to the publishable-key pattern is intentional. Old `.env` files referencing the anon key name will silently fail auth — double-check any legacy `.env.local` copies.
- **Vercel environment scoping:** Set sensitive keys (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`) to **Production + Preview only**, never Development. Use local `.env.local` for dev.
- **Preview deployments:** Each Vercel preview branch still hits the **production Supabase project** unless you create a separate preview project. Be mindful of writes.
- **`NEXT_PUBLIC_DEMO_MODE=true` in production:** This bypasses real auth and returns mock data — catastrophic if left on. CI/CD pipeline should assert this is `false` before deploying to production.

### Rollback — Environment
```bash
# Before deploying, snapshot current env manually
vercel env pull .env.backup --environment=production

# To recover a single wrong variable
vercel env rm NEXT_PUBLIC_DEMO_MODE production
vercel env add NEXT_PUBLIC_DEMO_MODE production   # type correct value
# Trigger redeploy with corrected env
vercel redeploy --prod
```

---

## 3. Vercel Deployments

### 3a. SaaS Platform
```bash
cd frontend/
vercel --prod
```
- [ ] Build logs show no type errors or missing module warnings
- [ ] Deployment URL resolves and returns HTTP 200
- [ ] `/api/payment/verify` returns 405 on GET (method guard working)
- [ ] `/demo` route renders sandbox banner and mock data only

### 3b. Storefront
```bash
cd Backend-Software/Store-Admin/store-front/
vercel --prod
```
- [ ] Slug routing works: `https://order.cafecanva.com/<tenant-slug>` resolves correctly
- [ ] Cart isolation: add items on slug A, navigate to slug B — cart is empty
- [ ] Razorpay checkout modal opens (test key in staging, live key in production)

### Rollback — Vercel
```bash
# Instant rollback to previous production deployment
vercel rollback --prod
# Or from the Vercel dashboard: Deployments → previous deploy → Promote to Production
# Time to rollback: ~30 seconds (no rebuild needed).
```

---

## 4. CI/CD Pipeline Checks (`deploy.yml`)

Verify these jobs run in the correct order:

```
lint → type-check → test → db-push (staging) → build-platform → build-storefront → deploy-platform → deploy-storefront
```

- [ ] Type check step is active in pipeline:
  ```yaml
  - name: Type check
    run: npm run type-check   # maps to: tsc --noEmit
  ```
- [ ] `db-push` job runs **before** app builds (schema must be ready before server-side code runs)
- [ ] `SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` secrets set in GitHub repo settings
- [ ] `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID_PLATFORM`, `VERCEL_PROJECT_ID_STOREFRONT` all set
- [ ] Branch protection on `main`: at least one approval + CI green required before merge

### Common CI failures and fixes

| Failure | Cause | Fix |
|---|---|---|
| `supabase: command not found` | CLI not installed in runner | Add `uses: supabase/setup-cli@v1` step |
| `Error: Cannot find module` | Workspace hoisting issue | Run `npm install` at root before sub-app build |
| Vercel deploy exits 1 silently | Missing `VERCEL_PROJECT_ID` | Verify secret name matches exactly in workflow YAML |
| Build succeeds but env vars undefined | Vars not added to Vercel project scope | Add via `vercel env add` or dashboard |

---

## 5. Post-Deploy Smoke Tests

Run these immediately after every production deploy:

### Platform
- [ ] **Auth:** Sign up a new account → confirm email → sign in → land on dashboard
- [ ] **Tenant creation:** Create a new café → slug generated → storefront URL correct
- [ ] **Menu CRUD:** Add → edit → delete a menu item
- [ ] **Payment flow:** Place a test order → Razorpay mock → webhook fires → order status updates
  * Test webhook delivery using the Razorpay CLI tool:
    ```bash
    razorpay-cli webhook trigger payment.captured \
      --url https://app.cafecanva.com/api/payment/verify
    ```
    Confirm order row status flips to 'paid' within 5s.

### Storefront
- [ ] **Menu loads:** `/slug` renders menu without auth
- [ ] **Cart persists:** Add 2 items → refresh page → cart retained (Zustand persistence)
- [ ] **Cross-tenant isolation:** Open two slugs in separate incognito windows → carts are independent
- [ ] **Staff call:** Trigger a call → staff_calls row created → RLS blocks anon reads from other tenants

### Database
```sql
-- Verify no orphaned sessions (run in Supabase SQL editor)
SELECT count(*) FROM table_sessions WHERE tenant_id IS NULL;
-- Expected: 0

-- Run as postgres role to inspect policy coverage
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('orders','order_items','table_sessions','staff_calls','customers')
ORDER BY tablename, cmd;
-- Every table must have SELECT policies with tenant_id = auth.uid() or scope check

-- API-level anonymous access check (run from terminal)
curl -s "https://<SUPABASE_URL>/rest/v1/orders?select=id" \
  -H "apikey: <ANON_KEY>" | jq length
# Expected: 0 — not the total order count
```

---

## 6. Rollback Decision Tree

```
Is the issue in the database schema?
  YES → Run migration rollback (Section 1c), then Vercel rollback
  NO  →
    Is the issue in environment variables?
      YES → Fix env vars in Vercel dashboard → Redeploy (30s)
      NO  →
        Is the build artifact broken?
          YES → vercel rollback --prod (30s, no rebuild)
          NO  →
            Is it a runtime code bug?
              YES → Hotfix branch → PR → fast-track merge → redeploy
```

### Rollback SLA targets

| Severity | Target resolution | Method |
|---|---|---|
| P0 — Payment broken / data exposed | < 5 min | `vercel rollback --prod` immediately |
| P1 — Auth broken / tenants can't log in | < 15 min | Vercel rollback + env fix |
| P2 — Feature regression | < 1 hour | Hotfix PR |
| P3 — UI glitch | Next release | Standard PR |

---

## 7. Release Sign-off

- [ ] All smoke tests passed
- [ ] No error spikes in Vercel Functions logs (check for 5xx responses)
- [ ] Supabase dashboard shows no sudden query latency increase
- [ ] This checklist committed with the release tag in git

```bash
git tag -a v1.x.x -m "Release v1.x.x — <one-line summary>"
git push origin v1.x.x
```

---

*Last updated: see git blame. Owned by: engineering lead.*
