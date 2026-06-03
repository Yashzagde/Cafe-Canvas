-- ================================================================
-- Migration 013: Staff Attendance & Leave Management
-- ================================================================
BEGIN;

-- Drop old tightly-coupled table if it exists
DROP TABLE IF EXISTS public.attendance CASCADE;

-- ── Staff Attendance ──────────────────────────────────────────────
CREATE TABLE public.staff_attendance (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID          NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id           UUID          NOT NULL REFERENCES public.branches(id)  ON DELETE CASCADE,
  staff_id            UUID          NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  shift_id            UUID                   REFERENCES public.pos_shifts(id) ON DELETE SET NULL,
  clock_in            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  clock_out           TIMESTAMPTZ,
  duration_minutes    INTEGER
    GENERATED ALWAYS AS (
      CASE WHEN clock_out IS NOT NULL
        THEN EXTRACT(EPOCH FROM (clock_out - clock_in))::INTEGER / 60
        ELSE NULL
      END
    ) STORED,
  source              TEXT          NOT NULL DEFAULT 'manual'
                        CHECK (source IN ('manual','pos','biometric')),
  notes               TEXT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_clock_range CHECK (clock_out IS NULL OR clock_out > clock_in),
  CONSTRAINT max_shift_hours   CHECK (
    clock_out IS NULL OR
    EXTRACT(EPOCH FROM (clock_out - clock_in)) <= 57600  -- 16 hours max
  )
);

CREATE INDEX idx_attendance_staff_date  ON public.staff_attendance (staff_id, clock_in DESC);
CREATE INDEX idx_attendance_branch_date ON public.staff_attendance (branch_id, clock_in DESC);
CREATE INDEX idx_attendance_open        ON public.staff_attendance (staff_id)
  WHERE clock_out IS NULL;

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attendance__own_records"
  ON public.staff_attendance FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "attendance__manager_owner_read"
  ON public.staff_attendance FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

CREATE POLICY "attendance__self_clock_in"
  ON public.staff_attendance FOR INSERT
  WITH CHECK (
    staff_id = auth.uid()
    AND tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "attendance__manager_insert"
  ON public.staff_attendance FOR INSERT
  WITH CHECK (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

CREATE POLICY "attendance__self_clock_out"
  ON public.staff_attendance FOR UPDATE
  USING (staff_id = auth.uid())
  WITH CHECK (staff_id = auth.uid());

CREATE POLICY "attendance__manager_update"
  ON public.staff_attendance FOR UPDATE
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- ── Staff Leaves ──────────────────────────────────────────────────
CREATE TABLE public.staff_leaves (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES public.tenants(id)  ON DELETE CASCADE,
  staff_id        UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type      TEXT          NOT NULL
                    CHECK (leave_type IN ('sick','casual','earned','unpaid','comp_off')),
  start_date      DATE          NOT NULL,
  end_date        DATE          NOT NULL,
  days_count      INTEGER
    GENERATED ALWAYS AS (
      (end_date - start_date) + 1
    ) STORED,
  status          TEXT          NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','cancelled')),
  reason          TEXT,
  approved_by     UUID          REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  rejection_note  TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_leave_range CHECK (end_date >= start_date),
  CONSTRAINT max_leave_days    CHECK ((end_date - start_date) + 1 <= 30)
);

CREATE INDEX idx_leaves_staff  ON public.staff_leaves (staff_id, start_date DESC);
CREATE INDEX idx_leaves_status ON public.staff_leaves (tenant_id, status) WHERE status = 'pending';

ALTER TABLE public.staff_leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leaves__own_records"
  ON public.staff_leaves FOR SELECT  USING (staff_id = auth.uid());

CREATE POLICY "leaves__manager_owner_read"
  ON public.staff_leaves FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

CREATE POLICY "leaves__self_apply"
  ON public.staff_leaves FOR INSERT
  WITH CHECK (
    staff_id = auth.uid()
    AND status = 'pending'
    AND tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "leaves__manager_approve"
  ON public.staff_leaves FOR UPDATE
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

COMMIT;
