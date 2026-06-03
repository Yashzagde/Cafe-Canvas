-- ================================================================
-- Migration 020: Geo + Selfie columns on staff_attendance
-- ================================================================
BEGIN;

ALTER TABLE public.staff_attendance
  ADD COLUMN IF NOT EXISTS clock_in_lat           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS clock_in_lng            DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS clock_in_selfie_url     TEXT,
  ADD COLUMN IF NOT EXISTS clock_in_address        TEXT,
  ADD COLUMN IF NOT EXISTS clock_out_lat           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS clock_out_lng            DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS clock_out_selfie_url    TEXT,
  ADD COLUMN IF NOT EXISTS device_id               TEXT,
  ADD COLUMN IF NOT EXISTS geo_verified            BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS selfie_verified         BOOLEAN NOT NULL DEFAULT FALSE;

-- RPC: clock staff in with geo + selfie
CREATE OR REPLACE FUNCTION public.clock_in_staff(
  p_staff_id    UUID,
  p_branch_id   UUID,
  p_lat         DOUBLE PRECISION DEFAULT NULL,
  p_lng         DOUBLE PRECISION DEFAULT NULL,
  p_selfie_url  TEXT             DEFAULT NULL,
  p_address     TEXT             DEFAULT NULL,
  p_device_id   TEXT             DEFAULT NULL
) RETURNS public.staff_attendance
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_tenant_id UUID;
  v_row       public.staff_attendance%ROWTYPE;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.profiles WHERE id = p_staff_id;

  -- Prevent double clock-in
  IF EXISTS (
    SELECT 1 FROM public.staff_attendance
    WHERE staff_id = p_staff_id AND clock_out IS NULL
  ) THEN
    RAISE EXCEPTION 'Staff already clocked in (open attendance record exists)';
  END IF;

  INSERT INTO public.staff_attendance (
    tenant_id, branch_id, staff_id,
    clock_in, clock_in_lat, clock_in_lng,
    clock_in_selfie_url, clock_in_address,
    device_id, source
  ) VALUES (
    v_tenant_id, p_branch_id, p_staff_id,
    NOW(), p_lat, p_lng,
    p_selfie_url, p_address,
    p_device_id, 'pos'
  ) RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- RPC: clock staff out
CREATE OR REPLACE FUNCTION public.clock_out_staff(
  p_staff_id        UUID,
  p_lat             DOUBLE PRECISION DEFAULT NULL,
  p_lng             DOUBLE PRECISION DEFAULT NULL,
  p_selfie_url      TEXT             DEFAULT NULL
) RETURNS public.staff_attendance
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row public.staff_attendance%ROWTYPE;
END;
$$;

-- Re-implement clock_out_staff to correctly define structure and functionality
CREATE OR REPLACE FUNCTION public.clock_out_staff(
  p_staff_id        UUID,
  p_lat             DOUBLE PRECISION DEFAULT NULL,
  p_lng             DOUBLE PRECISION DEFAULT NULL,
  p_selfie_url      TEXT             DEFAULT NULL
) RETURNS public.staff_attendance
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row public.staff_attendance%ROWTYPE;
BEGIN
  UPDATE public.staff_attendance
  SET    clock_out             = NOW(),
         clock_out_lat         = p_lat,
         clock_out_lng         = p_lng,
         clock_out_selfie_url  = p_selfie_url
  WHERE  staff_id = p_staff_id
    AND  clock_out IS NULL
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No open attendance record found for staff %', p_staff_id;
  END IF;

  RETURN v_row;
END;
$$;

COMMIT;
