-- =========================================================================
-- CafeCanvas — Security Hotfix: payment_integrations RLS Policy Hardening
-- =========================================================================

-- Drop the vulnerable policy that allows all authenticated users to read integration credentials
DROP POLICY IF EXISTS "authenticated_payments" ON payment_integrations;

-- Create a hardened policy restricting access to owners and managers scoped to their tenant
CREATE POLICY "owner_payments" ON payment_integrations
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));
