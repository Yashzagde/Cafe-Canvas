-- ============================================================
-- CAFE CANVAS — 033_security_hardening_policies.sql
-- Hardening Supabase RPC Functions against Exploit Vectors
-- ============================================================

-- ── 1. HARDEN request_customer_otp (Rate Limiting) ───────────
CREATE OR REPLACE FUNCTION public.request_customer_otp(
  p_phone TEXT,
  p_tenant_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp TEXT;
  v_expires_at TIMESTAMPTZ;
  recent_count INT;
BEGIN
  -- Rate limiting: Max 3 OTP requests per phone per tenant in the last 10 minutes
  SELECT COUNT(*) INTO recent_count
  FROM public.customer_otp_sessions
  WHERE phone = p_phone
    AND tenant_id = p_tenant_id
    AND created_at > now() - INTERVAL '10 minutes';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many OTP requests. Please wait before trying again.';
  END IF;

  -- Generate 6-digit OTP
  v_otp := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  v_expires_at := now() + interval '5 minutes';

  -- Insert SHA-256 hashed OTP into customer_otp_sessions
  INSERT INTO public.customer_otp_sessions (phone, otp_hash, expires_at, verified, tenant_id, attempts)
  VALUES (p_phone, encode(digest(v_otp, 'sha256'), 'hex'), v_expires_at, false, p_tenant_id, 0);

  RETURN v_otp;
END;
$$;


-- ── 2. HARDEN verify_customer_otp_and_checkin (Lockout Checks) ──
CREATE OR REPLACE FUNCTION public.verify_customer_otp_and_checkin(
  p_phone TEXT,
  p_otp TEXT,
  p_tenant_id UUID,
  p_is_quick BOOLEAN
) RETURNS TABLE (
  success BOOLEAN,
  error_msg TEXT,
  visits INT,
  public_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_customer_id UUID;
  v_visits INT;
  v_is_new BOOLEAN;
  v_public_id TEXT;
  v_otp_hash TEXT;
BEGIN
  -- 1. If not quick checkin, verify OTP
  IF NOT p_is_quick THEN
    v_otp_hash := encode(digest(p_otp, 'sha256'), 'hex');

    -- Check if active session is locked out
    IF EXISTS (
      SELECT 1 FROM public.customer_otp_sessions
      WHERE phone = p_phone 
        AND verified = false 
        AND expires_at > now() 
        AND tenant_id = p_tenant_id 
        AND attempts >= 3
    ) THEN
      RETURN QUERY SELECT false, 'Too many failed attempts. Request a new OTP.'::TEXT, 0, NULL::TEXT;
      RETURN;
    END IF;

    SELECT id INTO v_session_id
    FROM public.customer_otp_sessions
    WHERE phone = p_phone
      AND otp_hash = v_otp_hash
      AND verified = false
      AND expires_at > now()
      AND attempts < 3
      AND tenant_id = p_tenant_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_session_id IS NULL THEN
      -- Increment attempts for the active session
      UPDATE public.customer_otp_sessions
      SET attempts = attempts + 1
      WHERE id = (
        SELECT id FROM public.customer_otp_sessions
        WHERE phone = p_phone AND verified = false AND expires_at > now() AND tenant_id = p_tenant_id
        ORDER BY created_at DESC LIMIT 1
      );

      RETURN QUERY SELECT false, 'Invalid or expired OTP code'::TEXT, 0, NULL::TEXT;
      RETURN;
    END IF;

    -- Mark OTP as verified
    UPDATE public.customer_otp_sessions
    SET verified = true
    WHERE id = v_session_id;
  END IF;

  -- 2. Fetch or create customer
  SELECT id, total_visits INTO v_customer_id, v_visits
  FROM public.customers
  WHERE tenant_id = p_tenant_id
    AND phone = p_phone
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    v_visits := 1;
    v_is_new := true;
    INSERT INTO public.customers (tenant_id, phone, name, total_visits, total_spent, last_visit_at)
    VALUES (p_tenant_id, p_phone, 'Storefront Guest', 1, 0, now());
  ELSE
    v_visits := COALESCE(v_visits, 0) + 1;
    v_is_new := false;
    UPDATE public.customers
    SET total_visits = v_visits,
        last_visit_at = now()
    WHERE id = v_customer_id;
  END IF;

  -- 3. Log notification for Store Admin and Staff POS
  INSERT INTO public.notification_log (tenant_id, type, payload, read)
  VALUES (
    p_tenant_id,
    'customer_checkin',
    jsonb_build_object(
      'customer_name', 'Storefront Guest',
      'phone', p_phone,
      'visits', v_visits,
      'is_new', v_is_new
    ),
    false
  );

  -- 4. Get tenant public_id
  SELECT COALESCE(public_id, '') INTO v_public_id
  FROM public.tenants
  WHERE id = p_tenant_id;

  RETURN QUERY SELECT true, NULL::TEXT, v_visits, v_public_id;
END;
$$;


-- ── 3. HARDEN revoke_other_tenant_sessions (Cross-Tenant check) ─
CREATE OR REPLACE FUNCTION public.revoke_other_tenant_sessions(
  p_tenant_id UUID,
  p_keep_token TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_tenant_id UUID;
  v_caller_role TEXT;
BEGIN
  -- 1. Resolve caller tenant_id and role
  -- Sourced from JWT app_metadata first, fallback to staff_accounts query
  v_caller_tenant_id := (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID;
  IF v_caller_tenant_id IS NULL THEN
    SELECT tenant_id, role INTO v_caller_tenant_id, v_caller_role
    FROM public.staff_accounts
    WHERE auth_user_id = auth.uid()
    LIMIT 1;
  ELSE
    v_caller_role := auth.jwt() -> 'app_metadata' ->> 'role';
  END IF;

  -- 2. Enforce Tenant Isolation
  IF v_caller_tenant_id IS NULL OR v_caller_tenant_id != p_tenant_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot revoke sessions for another tenant.';
  END IF;

  -- 3. Enforce Role Validation (only owners, managers, admins)
  IF v_caller_role NOT IN ('owner', 'manager', 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: insufficient role to revoke sessions.';
  END IF;

  UPDATE public.tenant_sessions
  SET is_active = false, revoked_at = now()
  WHERE tenant_id = p_tenant_id
    AND session_token != p_keep_token
    AND is_active = true;
END;
$$;


-- ── 4. HARDEN clock_in_staff / clock_out_staff (Self-identity) ──
CREATE OR REPLACE FUNCTION public.clock_in_staff(
  p_staff_id UUID,
  p_branch_id UUID,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_selfie_url TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL
) RETURNS public.staff_attendance
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_caller_staff_id UUID;
  v_record public.staff_attendance;
BEGIN
  -- 1. Verify caller is clocking in THEMSELVES
  SELECT id INTO v_caller_staff_id
  FROM public.staff_accounts
  WHERE auth_user_id = auth.uid();

  IF v_caller_staff_id IS NULL OR v_caller_staff_id != p_staff_id THEN
    RAISE EXCEPTION 'Unauthorized: you can only clock in yourself.';
  END IF;

  -- 2. Find tenant_id from staff_accounts
  SELECT tenant_id INTO v_tenant_id FROM public.staff_accounts WHERE id = p_staff_id LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Staff account not found.';
  END IF;
  
  -- 3. Check if already clocked in
  IF EXISTS (SELECT 1 FROM public.staff_attendance WHERE staff_id = p_staff_id AND status = 'clocked_in') THEN
    RAISE EXCEPTION 'Staff is already clocked in.';
  END IF;
  
  INSERT INTO public.staff_attendance (
    tenant_id,
    branch_id,
    staff_id,
    clock_in,
    clock_in_lat,
    clock_in_lng,
    clock_in_selfie_url,
    clock_in_address,
    device_id,
    status,
    source
  ) VALUES (
    v_tenant_id,
    p_branch_id,
    p_staff_id,
    NOW(),
    p_lat,
    p_lng,
    p_selfie_url,
    p_address,
    p_device_id,
    'clocked_in',
    'pos'
  ) RETURNING * INTO v_record;
  
  RETURN v_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.clock_out_staff(
  p_staff_id UUID,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_selfie_url TEXT DEFAULT NULL
) RETURNS public.staff_attendance
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_staff_id UUID;
  v_record public.staff_attendance;
  v_clock_out TIMESTAMPTZ;
  v_duration INT;
BEGIN
  -- 1. Verify caller is clocking out THEMSELVES
  SELECT id INTO v_caller_staff_id
  FROM public.staff_accounts
  WHERE auth_user_id = auth.uid();

  IF v_caller_staff_id IS NULL OR v_caller_staff_id != p_staff_id THEN
    RAISE EXCEPTION 'Unauthorized: you can only clock out yourself.';
  END IF;

  v_clock_out := NOW();
  
  -- 2. Find the active clocked_in session
  SELECT * INTO v_record FROM public.staff_attendance 
    WHERE staff_id = p_staff_id AND status = 'clocked_in' 
    ORDER BY clock_in DESC LIMIT 1;
    
  IF v_record.id IS NULL THEN
    RAISE EXCEPTION 'No active clock-in session found for this staff member.';
  END IF;
  
  v_duration := EXTRACT(EPOCH FROM (v_clock_out - v_record.clock_in)) / 60;
  
  UPDATE public.staff_attendance SET
    clock_out = v_clock_out,
    clock_out_lat = p_lat,
    clock_out_lng = p_lng,
    clock_out_selfie_url = p_selfie_url,
    status = 'clocked_out',
    duration_minutes = v_duration,
    total_minutes = v_duration
  WHERE id = v_record.id
  RETURNING * INTO v_record;
  
  RETURN v_record;
END;
$$;


-- ── 5. GRANTS & CALLABLE RIGHTS ──────────────────────────────
REVOKE EXECUTE ON FUNCTION public.clock_in_staff(uuid, uuid, double precision, double precision, text, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.clock_in_staff(uuid, uuid, double precision, double precision, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.clock_out_staff(uuid, double precision, double precision, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.clock_out_staff(uuid, double precision, double precision, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.revoke_other_tenant_sessions(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.revoke_other_tenant_sessions(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.request_customer_otp(text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.request_customer_otp(text, uuid) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.verify_customer_otp_and_checkin(text, text, uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_customer_otp_and_checkin(text, text, uuid, boolean) TO anon, authenticated;
