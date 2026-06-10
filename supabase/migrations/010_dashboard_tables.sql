-- =========================================================================
-- CafeCanvas — 010_dashboard_tables.sql
-- =========================================================================

-- Ensure staff_accounts has a 'name' column (compatibility with users view joins)
-- Using a generated column to keep it in sync with full_name without manual updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'staff_accounts' 
      AND column_name = 'name'
  ) THEN
    ALTER TABLE public.staff_accounts ADD COLUMN name TEXT GENERATED ALWAYS AS (full_name) STORED;
  END IF;
END $$;

-- 1. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('owner', 'manager', 'cashier', 'kitchen', 'staff', 'system')),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STAFF ATTENDANCE
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE CASCADE NOT NULL,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  clock_in_lat NUMERIC,
  clock_in_lng NUMERIC,
  clock_out_lat NUMERIC,
  clock_out_lng NUMERIC,
  clock_in_selfie_url TEXT,
  clock_out_selfie_url TEXT,
  clock_in_address TEXT,
  device_id TEXT,
  status TEXT NOT NULL DEFAULT 'clocked_in' CHECK (status IN ('clocked_in', 'clocked_out', 'auto_closed')),
  total_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shift_id UUID,
  duration_minutes INTEGER,
  source TEXT NOT NULL DEFAULT 'pos' CHECK (source IN ('manual', 'pos', 'biometric')),
  notes TEXT
);

-- 3. STAFF ACTIVITY FEED
CREATE TABLE IF NOT EXISTS public.staff_activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  display_text TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUSTOMER FEEDBACK
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Guest Diner',
  phone TEXT,
  rating_overall INTEGER NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_food INTEGER CHECK (rating_food >= 1 AND rating_food <= 5),
  rating_service INTEGER CHECK (rating_service >= 1 AND rating_service <= 5),
  comment TEXT,
  would_revisit BOOLEAN NOT NULL DEFAULT TRUE,
  staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on All Tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- RLS Policies (Idempotent: Drop first if exists)
-- -------------------------------------------------------------------------

DROP POLICY IF EXISTS "staff_read_audit_logs" ON public.audit_logs;
CREATE POLICY "staff_read_audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

DROP POLICY IF EXISTS "staff_read_attendance" ON public.staff_attendance;
CREATE POLICY "staff_read_attendance" ON public.staff_attendance
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_write_attendance" ON public.staff_attendance;
CREATE POLICY "staff_write_attendance" ON public.staff_attendance
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id())
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_read_activity" ON public.staff_activity_feed;
CREATE POLICY "staff_read_activity" ON public.staff_activity_feed
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_write_activity" ON public.staff_activity_feed;
CREATE POLICY "staff_write_activity" ON public.staff_activity_feed
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id())
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_read_feedback" ON public.customer_feedback;
CREATE POLICY "staff_read_feedback" ON public.customer_feedback
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "public_insert_feedback" ON public.customer_feedback;
CREATE POLICY "public_insert_feedback" ON public.customer_feedback
  FOR INSERT TO public, anon, authenticated
  WITH CHECK (tenant_id IS NOT NULL);

DROP POLICY IF EXISTS "manager_write_feedback" ON public.customer_feedback;
CREATE POLICY "manager_write_feedback" ON public.customer_feedback
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- -------------------------------------------------------------------------
-- Clock-In / Clock-Out RPC Functions
-- -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.clock_in_staff(
  p_staff_id UUID,
  p_branch_id UUID,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_selfie_url TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL
) RETURNS public.staff_attendance AS $$
DECLARE
  v_tenant_id UUID;
  v_record public.staff_attendance;
BEGIN
  -- Find tenant_id from staff_accounts
  SELECT tenant_id INTO v_tenant_id FROM public.staff_accounts WHERE id = p_staff_id OR auth_user_id = p_staff_id LIMIT 1;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Staff account not found.';
  END IF;
  
  -- Check if already clocked in
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


CREATE OR REPLACE FUNCTION public.clock_out_staff(
  p_staff_id UUID,
  p_lat DOUBLE PRECISION DEFAULT NULL,
  p_lng DOUBLE PRECISION DEFAULT NULL,
  p_selfie_url TEXT DEFAULT NULL
) RETURNS public.staff_attendance AS $$
DECLARE
  v_record public.staff_attendance;
  v_clock_out TIMESTAMPTZ;
  v_duration INT;
BEGIN
  v_clock_out := NOW();
  
  -- Find the active clocked_in session
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
