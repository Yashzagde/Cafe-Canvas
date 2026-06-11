-- migration: 011_audit_logs_and_staff_calls.sql
-- Create audit_logs table and extend tenants / staff_calls tables

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for public.audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "staff_read_audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "staff_insert_audit_logs" ON public.audit_logs;

-- Select policy for staff accounts
CREATE POLICY "staff_read_audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

-- Insert policy for staff accounts
CREATE POLICY "staff_insert_audit_logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_tenant_id());

-- 2. Add private_id to tenants table
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS private_id UUID DEFAULT gen_random_uuid() UNIQUE;

-- 3. Add location_id to staff_calls table
ALTER TABLE public.staff_calls ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE;

-- Populate existing staff_calls.location_id from tables
UPDATE public.staff_calls sc
SET location_id = t.location_id
FROM public.tables t
WHERE sc.table_id = t.id AND sc.location_id IS NULL;
