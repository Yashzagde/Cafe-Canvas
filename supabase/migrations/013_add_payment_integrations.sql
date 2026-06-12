-- migration: 013_add_payment_integrations.sql
-- Create payment_integrations table, configure hardened RLS, add compatibility fields to table_sessions and bills.

-- 1. Create payment_integrations table
CREATE TABLE IF NOT EXISTS public.payment_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  encrypted_config JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Configure RLS on payment_integrations
ALTER TABLE public.payment_integrations ENABLE ROW LEVEL SECURITY;

-- Drop any legacy policies if exists
DROP POLICY IF EXISTS "authenticated_payments" ON public.payment_integrations;
DROP POLICY IF EXISTS "staff_read_payment_config" ON public.payment_integrations;
DROP POLICY IF EXISTS "manager_write_payment_config" ON public.payment_integrations;
DROP POLICY IF EXISTS "owner_insert_payment_config" ON public.payment_integrations;
DROP POLICY IF EXISTS "owner_delete_payment_config" ON public.payment_integrations;
DROP POLICY IF EXISTS "service_role_full_access" ON public.payment_integrations;
DROP POLICY IF EXISTS "block_anon_payments" ON public.payment_integrations;

-- Policy A: Only OWNER and MANAGER roles can read payment configuration (SELECT)
CREATE POLICY "staff_read_payment_config" ON public.payment_integrations
  FOR SELECT TO authenticated
  USING (
    tenant_id = get_tenant_id() 
    AND get_user_role() IN ('owner', 'manager')
  );

-- Policy B: Only OWNER/MANAGER can update payment settings (UPDATE)
CREATE POLICY "manager_write_payment_config" ON public.payment_integrations
  FOR UPDATE TO authenticated
  USING (
    tenant_id = get_tenant_id() 
    AND get_user_role() IN ('owner', 'manager')
  )
  WITH CHECK (
    tenant_id = get_tenant_id() 
    AND get_user_role() IN ('owner', 'manager')
  );

-- Policy C: Only OWNER can insert payment config (INSERT)
CREATE POLICY "owner_insert_payment_config" ON public.payment_integrations
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = get_tenant_id() 
    AND get_user_role() = 'owner'
  );

-- Policy D: Only OWNER can delete payment config (DELETE)
CREATE POLICY "owner_delete_payment_config" ON public.payment_integrations
  FOR DELETE TO authenticated
  USING (
    tenant_id = get_tenant_id() 
    AND get_user_role() = 'owner'
  );

-- Policy E: Allow service_role full access (for Edge Functions)
CREATE POLICY "service_role_full_access" ON public.payment_integrations
  FOR ALL TO service_role
  USING (true);

-- Policy F: Explicitly block anonymous access
CREATE POLICY "block_anon_payments" ON public.payment_integrations
  FOR ALL TO anon
  USING (false);


-- 3. Add compatibility columns to table_sessions table
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS check_out_at TIMESTAMPTZ;
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS total_revenue INTEGER DEFAULT 0;
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL;

-- 4. Sync existing records' check_in_at and check_out_at
UPDATE public.table_sessions 
SET check_in_at = started_at, check_out_at = ended_at
WHERE check_in_at IS NULL OR check_out_at IS NULL;

-- 5. Create trigger function to keep started_at ↔ check_in_at and ended_at ↔ check_out_at synced
CREATE OR REPLACE FUNCTION public.sync_table_sessions_compatibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync check_in_at and started_at
  IF NEW.started_at IS NOT NULL AND NEW.check_in_at IS NULL THEN
    NEW.check_in_at := NEW.started_at;
  ELSIF NEW.check_in_at IS NOT NULL AND NEW.started_at IS NULL THEN
    NEW.started_at := NEW.check_in_at;
  END IF;

  -- Sync check_out_at and ended_at
  IF NEW.ended_at IS NOT NULL AND NEW.check_out_at IS NULL THEN
    NEW.check_out_at := NEW.ended_at;
  ELSIF NEW.check_out_at IS NOT NULL AND NEW.ended_at IS NULL THEN
    NEW.ended_at := NEW.check_out_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_table_sessions_compatibility_trig ON public.table_sessions;
CREATE TRIGGER sync_table_sessions_compatibility_trig
BEFORE INSERT OR UPDATE ON public.table_sessions
FOR EACH ROW EXECUTE FUNCTION public.sync_table_sessions_compatibility();


-- 6. Add table_id column to bills table
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL;
