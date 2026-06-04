-- ================================================================
-- Migration 029: Godmode Core Tables
-- ================================================================
BEGIN;

-- 1. Shift Schedules Table
CREATE TABLE IF NOT EXISTS public.shift_schedules (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id   UUID          NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  staff_id    UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shift_date  DATE          NOT NULL,
  start_time  TIME          NOT NULL,
  end_time    TIME          NOT NULL,
  status      TEXT          NOT NULL DEFAULT 'working' CHECK (status IN ('working', 'leave', 'holiday')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id          UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  leave_type        TEXT          NOT NULL CHECK (leave_type IN ('sick', 'casual', 'earned', 'unpaid')),
  start_date        DATE          NOT NULL,
  end_date          DATE          NOT NULL,
  reason            TEXT,
  status            TEXT          NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by       UUID          REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_leave_dates CHECK (end_date >= start_date)
);

-- 3. Customer Feedback Table
CREATE TABLE IF NOT EXISTS public.customer_feedback (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  table_id        UUID          REFERENCES public.tables(id) ON DELETE SET NULL,
  customer_name   TEXT          NOT NULL,
  phone           TEXT,
  rating_overall  INTEGER       NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_food     INTEGER       CHECK (rating_food >= 1 AND rating_food <= 5),
  rating_service  INTEGER       CHECK (rating_service >= 1 AND rating_service <= 5),
  comment         TEXT,
  would_revisit   BOOLEAN       NOT NULL DEFAULT TRUE,
  staff_id        UUID          REFERENCES public.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4. Customer OTP Sessions Table
CREATE TABLE IF NOT EXISTS public.customer_otp_sessions (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT          NOT NULL,
  otp         TEXT          NOT NULL,
  verified    BOOLEAN       NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ   NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 5. Customer Offers Table
CREATE TABLE IF NOT EXISTS public.customer_offers (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title             TEXT          NOT NULL,
  description       TEXT          NOT NULL,
  discount_percent  INTEGER       CHECK (discount_percent > 0 AND discount_percent <= 100),
  valid_until       TIMESTAMPTZ   NOT NULL,
  is_active         BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 6. Table Assignment Log Table
CREATE TABLE IF NOT EXISTS public.table_assignment_log (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  table_id        UUID          NOT NULL REFERENCES public.tables(id) ON DELETE CASCADE,
  staff_id        UUID          REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  unassigned_at   TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_otp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_assignment_log ENABLE ROW LEVEL SECURITY;

-- Create basic RLS Policies (tenant-scoped)
DROP POLICY IF EXISTS shift_schedules_select ON public.shift_schedules;
CREATE POLICY shift_schedules_select ON public.shift_schedules
  FOR SELECT USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

DROP POLICY IF EXISTS shift_schedules_all ON public.shift_schedules;
CREATE POLICY shift_schedules_all ON public.shift_schedules
  FOR ALL USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

DROP POLICY IF EXISTS leave_requests_select ON public.leave_requests;
CREATE POLICY leave_requests_select ON public.leave_requests
  FOR SELECT USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

DROP POLICY IF EXISTS leave_requests_all ON public.leave_requests;
CREATE POLICY leave_requests_all ON public.leave_requests
  FOR ALL USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

DROP POLICY IF EXISTS customer_feedback_select ON public.customer_feedback;
CREATE POLICY customer_feedback_select ON public.customer_feedback
  FOR SELECT USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

DROP POLICY IF EXISTS customer_feedback_insert ON public.customer_feedback;
CREATE POLICY customer_feedback_insert ON public.customer_feedback
  FOR INSERT WITH CHECK (true); -- Customers can insert feedback

DROP POLICY IF EXISTS customer_otp_sessions_all ON public.customer_otp_sessions;
CREATE POLICY customer_otp_sessions_all ON public.customer_otp_sessions
  FOR ALL USING (true); -- Public OTP validation with verification logic

DROP POLICY IF EXISTS customer_offers_select ON public.customer_offers;
CREATE POLICY customer_offers_select ON public.customer_offers
  FOR SELECT USING (true); -- Customers can view active offers

DROP POLICY IF EXISTS customer_offers_all ON public.customer_offers;
CREATE POLICY customer_offers_all ON public.customer_offers
  FOR ALL USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

DROP POLICY IF EXISTS table_assignment_log_select ON public.table_assignment_log;
CREATE POLICY table_assignment_log_select ON public.table_assignment_log
  FOR SELECT USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

DROP POLICY IF EXISTS table_assignment_log_all ON public.table_assignment_log;
CREATE POLICY table_assignment_log_all ON public.table_assignment_log
  FOR ALL USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

COMMIT;
