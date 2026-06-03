-- ================================================================
-- Migration 028: Tenant Registration Requests Flow & Staff Cap
-- ================================================================

BEGIN;

-- 1. Create Tenant Registration Requests Table
CREATE TABLE IF NOT EXISTS public.tenant_registration_requests (
  id                    UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name         TEXT                 NOT NULL,
  owner_name            TEXT                 NOT NULL,
  phone                 TEXT                 NOT NULL,
  email                 TEXT                 NOT NULL,
  gstin                 TEXT,
  fssai_number          TEXT,
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  country               TEXT,
  business_type         TEXT                 CHECK (business_type IN ('cafe', 'restaurant', 'bar', 'bakery', 'cloud_kitchen', 'other')),
  expected_staff_count  INTEGER              DEFAULT 1,
  expected_branch_count INTEGER              DEFAULT 1,
  plan_key              TEXT,
  status                TEXT                 DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason      TEXT,
  created_at            TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.tenant_registration_requests ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow anyone to submit a request from the landing page (anon insert)
DROP POLICY IF EXISTS tenant_registration_requests_insert ON public.tenant_registration_requests;
CREATE POLICY tenant_registration_requests_insert ON public.tenant_registration_requests
  FOR INSERT WITH CHECK (true);

-- Allow Super Admins full access (Select/Update/Delete)
DROP POLICY IF EXISTS tenant_registration_requests_superadmin ON public.tenant_registration_requests;
CREATE POLICY tenant_registration_requests_superadmin ON public.tenant_registration_requests
  FOR ALL USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'
    OR EXISTS (
      SELECT 1 FROM public.super_admin_users
      WHERE id = auth.uid()
    )
  );

-- 4. Trigger to Enforce 50 Staff Account Limit per Tenant
CREATE OR REPLACE FUNCTION check_staff_limit() 
RETURNS TRIGGER AS $$
DECLARE
  staff_count INTEGER;
BEGIN
  -- Exclude superadmin users who have NULL tenant_id
  IF NEW.tenant_id IS NOT NULL THEN
    SELECT COUNT(*) INTO staff_count FROM public.users WHERE tenant_id = NEW.tenant_id;
    IF staff_count >= 50 THEN
      RAISE EXCEPTION 'Staff limit reached. Maximum allowed staff accounts is 50.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_enforce_staff_limit ON public.users;
CREATE TRIGGER tr_enforce_staff_limit
BEFORE INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION check_staff_limit();

COMMIT;
