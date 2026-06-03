-- ================================================================
-- Migration 019: Staff Auth Extensions + Bartender Role + Devices
-- ================================================================
BEGIN;

-- Extend profiles: add missing auth and identification fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone              TEXT,
  ADD COLUMN IF NOT EXISTS pin_hash           TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url         TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS device_tokens      TEXT[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_language TEXT        DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS staff_code         TEXT,
  ADD COLUMN IF NOT EXISTS job_title          TEXT;

-- Unique staff_code per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_staff_code
  ON public.profiles (tenant_id, staff_code)
  WHERE staff_code IS NOT NULL;

-- Add 'bartender' to role constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('owner','manager','cashier','kitchen','staff','bartender'));

-- Mirror in audit_logs actor_role to include bartender
ALTER TABLE public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_actor_role_check;
ALTER TABLE public.audit_logs
  ADD CONSTRAINT audit_logs_actor_role_check
    CHECK (actor_role IN ('owner','manager','cashier','kitchen','staff','bartender','system'));

-- Staff devices: track registered Flutter/Web devices per staff
CREATE TABLE public.staff_devices (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      UUID        NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  tenant_id     UUID        NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  device_id     TEXT        NOT NULL,
  device_name   TEXT,
  platform      TEXT        CHECK (platform IN ('android','ios','web')),
  fcm_token     TEXT,
  app_version   TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (staff_id, device_id)
);

CREATE INDEX idx_devices_tenant ON public.staff_devices (tenant_id);
CREATE INDEX idx_devices_staff  ON public.staff_devices (staff_id);

ALTER TABLE public.staff_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devices__own_records"
  ON public.staff_devices FOR ALL
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "devices__manager_view"
  ON public.staff_devices FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

COMMIT;
