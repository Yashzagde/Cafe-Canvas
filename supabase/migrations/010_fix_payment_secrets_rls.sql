-- =========================================================================
-- MIGRATION 010: Fix Critical RLS Vulnerability in payment_integrations
-- =========================================================================
-- SECURITY CRITICAL: Drop overly permissive policy that exposes Razorpay
-- key_secret to all authenticated staff. Replace with role-based access.
--
-- Vulnerable policy allowed: ANY authenticated staff to read/write secrets
-- Fixed policy allows:  OWNER/MANAGER read-only; SERVICE_ROLE programmatic access
-- =========================================================================

-- Step 1: Drop the vulnerable policy
DROP POLICY IF EXISTS "authenticated_payments" ON payment_integrations;

-- Step 2: Create restrictive policy for staff (READ ONLY for OWNER/MANAGER)
-- Only OWNER and MANAGER roles can read payment configuration
-- Regular staff, POS operators, KDS staff are BLOCKED
CREATE POLICY "staff_read_payment_config" ON payment_integrations
  FOR SELECT TO authenticated
  USING (
    tenant_id = get_tenant_id() 
    AND get_user_role() IN ('owner', 'manager')
  );

-- Step 3: Create policy for updates (OWNER/MANAGER only)
-- Only OWNER/MANAGER can update payment settings
CREATE POLICY "manager_write_payment_config" ON payment_integrations
  FOR UPDATE TO authenticated
  USING (
    tenant_id = get_tenant_id() 
    AND get_user_role() IN ('owner', 'manager')
  )
  WITH CHECK (
    tenant_id = get_tenant_id() 
    AND get_user_role() IN ('owner', 'manager')
  );

-- Step 4: Create policy for inserts (OWNER only during initial setup)
CREATE POLICY "owner_insert_payment_config" ON payment_integrations
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = get_tenant_id() 
    AND get_user_role() = 'owner'
  );

-- Step 5: Create policy for deletes (OWNER only)
CREATE POLICY "owner_delete_payment_config" ON payment_integrations
  FOR DELETE TO authenticated
  USING (
    tenant_id = get_tenant_id() 
    AND get_user_role() = 'owner'
  );

-- Step 6: Allow service_role full access (for Edge Functions only)
-- Service role is NEVER exposed to clients; only used server-side
CREATE POLICY "service_role_full_access" ON payment_integrations
  FOR ALL TO service_role
  USING (true);

-- Step 7: Explicitly block all anonymous access
CREATE POLICY "block_anon_payments" ON payment_integrations
  FOR ALL TO anon
  USING (false);

-- =========================================================================
-- VERIFICATION & AUDIT
-- =========================================================================
-- Run these checks after migration:
-- 1. SELECT * FROM pg_policies WHERE tablename = 'payment_integrations';
-- 2. Run qa-agent verification tests (see /docs/security/audit-sprint2.md)
-- =========================================================================
