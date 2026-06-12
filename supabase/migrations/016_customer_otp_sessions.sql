-- =========================================================================
-- CafeCanvas — 016_customer_otp_sessions.sql
-- =========================================================================

-- Create customer_otp_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customer_otp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Service role will bypass, no public policy to keep it secure)
ALTER TABLE public.customer_otp_sessions ENABLE ROW LEVEL SECURITY;

-- 1. request_customer_otp: SECURITY DEFINER RPC to request OTP from storefront
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
BEGIN
  -- Generate 6-digit OTP
  v_otp := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  v_expires_at := now() + interval '5 minutes';

  -- Insert into sessions
  INSERT INTO public.customer_otp_sessions (phone, otp, expires_at, verified)
  VALUES (p_phone, v_otp, v_expires_at, false);

  RETURN v_otp;
END;
$$;

-- 2. verify_customer_otp_and_checkin: SECURITY DEFINER RPC to verify OTP and check-in customer
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
BEGIN
  -- 1. If not quick checkin, verify OTP
  IF NOT p_is_quick THEN
    SELECT id INTO v_session_id
    FROM public.customer_otp_sessions
    WHERE phone = p_phone
      AND otp = p_otp
      AND verified = false
      AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_session_id IS NULL THEN
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
  INSERT INTO public.notification_log (tenant_id, type, title, body, read)
  VALUES (
    p_tenant_id,
    'customer_checkin',
    CASE WHEN v_is_new THEN 'New Customer Registered' ELSE 'Customer Checked In' END,
    'Customer with phone number ' || p_phone || ' checked in on the digital menu (Visit #' || v_visits || ').',
    false
  );

  -- 4. Get tenant public_id
  SELECT COALESCE(public_id, '') INTO v_public_id
  FROM public.tenants
  WHERE id = p_tenant_id;

  RETURN QUERY SELECT true, NULL::TEXT, v_visits, v_public_id;
END;
$$;

-- Grant permissions to public role so anon users can execute them
GRANT EXECUTE ON FUNCTION public.request_customer_otp(TEXT, UUID) TO public;
GRANT EXECUTE ON FUNCTION public.verify_customer_otp_and_checkin(TEXT, TEXT, UUID, BOOLEAN) TO public;
