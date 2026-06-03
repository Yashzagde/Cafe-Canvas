-- ================================================================
-- Migration 014: Staff Performance Snapshots
-- ================================================================
BEGIN;

CREATE TABLE public.staff_performance_snapshots (
  id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID          NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id                UUID          NOT NULL REFERENCES public.branches(id)  ON DELETE CASCADE,
  staff_id                 UUID          NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  period_start             DATE          NOT NULL,
  period_end               DATE          NOT NULL,
  orders_handled           INTEGER       NOT NULL DEFAULT 0,
  total_sales_paise        INTEGER       NOT NULL DEFAULT 0,
  avg_order_value_paise    INTEGER
    GENERATED ALWAYS AS (
      CASE WHEN orders_handled > 0
        THEN total_sales_paise / orders_handled
        ELSE 0
      END
    ) STORED,
  void_count               INTEGER       NOT NULL DEFAULT 0,
  discount_count           INTEGER       NOT NULL DEFAULT 0,
  discount_total_paise     INTEGER       NOT NULL DEFAULT 0,
  avg_table_turn_minutes   INTEGER,
  total_hours_worked       NUMERIC(6,2)  NOT NULL DEFAULT 0,
  late_clock_ins           INTEGER       NOT NULL DEFAULT 0,
  absent_days              INTEGER       NOT NULL DEFAULT 0,
  computed_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  UNIQUE (staff_id, period_start, period_end)
);

CREATE INDEX idx_perf_staff_period ON public.staff_performance_snapshots
  (staff_id, period_start DESC);
CREATE INDEX idx_perf_branch_period ON public.staff_performance_snapshots
  (branch_id, period_start DESC);

ALTER TABLE public.staff_performance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perf__own_records"
  ON public.staff_performance_snapshots FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "perf__manager_owner_read"
  ON public.staff_performance_snapshots FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- Function: materialise performance for a staff member over a date range
CREATE OR REPLACE FUNCTION public.compute_staff_performance(
  p_staff_id   UUID,
  p_start      DATE,
  p_end        DATE
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id  UUID;
  v_branch_id  UUID;
  v_orders     INTEGER;
  v_sales      INTEGER;
  v_voids      INTEGER;
  v_discounts  INTEGER;
  v_disc_total INTEGER;
  v_hours      NUMERIC;
BEGIN
  SELECT tenant_id, branch_id INTO v_tenant_id, v_branch_id
  FROM public.profiles WHERE id = p_staff_id;

  SELECT COUNT(*), COALESCE(SUM(b.total_amount_paise), 0)
  INTO v_orders, v_sales
  FROM public.orders o
  JOIN public.bills b ON b.order_id = o.id
  WHERE o.staff_id = p_staff_id
    AND o.created_at::DATE BETWEEN p_start AND p_end
    AND b.is_void = FALSE;

  SELECT COUNT(*) INTO v_voids FROM public.bills b
  JOIN public.orders o ON o.id = b.order_id
  WHERE o.staff_id = p_staff_id AND b.is_void = TRUE
    AND b.created_at::DATE BETWEEN p_start AND p_end;

  SELECT
    COUNT(*),
    COALESCE(SUM(oi.unit_price_paise * oi.qty), 0)
  INTO v_discounts, v_disc_total
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE o.staff_id = p_staff_id
    AND o.created_at::DATE BETWEEN p_start AND p_end;

  SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
  INTO v_hours
  FROM public.staff_attendance
  WHERE staff_id = p_staff_id
    AND clock_in::DATE BETWEEN p_start AND p_end;

  INSERT INTO public.staff_performance_snapshots (
    tenant_id, branch_id, staff_id, period_start, period_end,
    orders_handled, total_sales_paise, void_count, discount_count,
    discount_total_paise, total_hours_worked, computed_at
  ) VALUES (
    v_tenant_id, v_branch_id, p_staff_id, p_start, p_end,
    v_orders, v_sales, v_voids, v_discounts,
    v_disc_total, v_hours, NOW()
  )
  ON CONFLICT (staff_id, period_start, period_end)
  DO UPDATE SET
    orders_handled       = EXCLUDED.orders_handled,
    total_sales_paise    = EXCLUDED.total_sales_paise,
    void_count           = EXCLUDED.void_count,
    discount_count       = EXCLUDED.discount_count,
    discount_total_paise = EXCLUDED.discount_total_paise,
    total_hours_worked   = EXCLUDED.total_hours_worked,
    computed_at          = NOW();
END;
$$;

COMMIT;
