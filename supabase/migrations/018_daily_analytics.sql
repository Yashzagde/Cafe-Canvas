-- ================================================================
-- Migration 018: Daily Sales Analytics Rollups
-- ================================================================
BEGIN;

CREATE TABLE public.daily_sales_analytics (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID    NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id             UUID    NOT NULL REFERENCES public.branches(id)  ON DELETE CASCADE,
  date                  DATE    NOT NULL,
  total_revenue_paise   INTEGER NOT NULL DEFAULT 0,
  order_count           INTEGER NOT NULL DEFAULT 0,
  avg_order_paise       INTEGER
    GENERATED ALWAYS AS (
      CASE WHEN order_count > 0
        THEN total_revenue_paise / order_count
        ELSE 0
      END
    ) STORED,
  void_count            INTEGER NOT NULL DEFAULT 0,
  discount_total_paise  INTEGER NOT NULL DEFAULT 0,
  new_customers         INTEGER NOT NULL DEFAULT 0,
  covers                INTEGER NOT NULL DEFAULT 0,   -- diners served
  top_items             JSONB   NOT NULL DEFAULT '[]',
  payment_breakdown     JSONB   NOT NULL DEFAULT '{}', -- {cash: N, upi: N, card: N}
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (branch_id, date)
);

CREATE INDEX idx_analytics_branch_date ON public.daily_sales_analytics (branch_id, date DESC);
CREATE INDEX idx_analytics_tenant_date ON public.daily_sales_analytics (tenant_id, date DESC);

ALTER TABLE public.daily_sales_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analytics__manager_owner_read"
  ON public.daily_sales_analytics FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- Materialise analytics for a branch + date
CREATE OR REPLACE FUNCTION public.aggregate_daily_analytics(
  p_branch_id UUID,
  p_date      DATE
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id UUID;
  v_revenue   INTEGER;
  v_orders    INTEGER;
  v_voids     INTEGER;
  v_discounts INTEGER;
  v_top_items JSONB;
  v_payment   JSONB;
BEGIN
  SELECT tenant_id INTO v_tenant_id FROM public.branches WHERE id = p_branch_id;

  SELECT
    COALESCE(SUM(b.total_amount_paise), 0),
    COUNT(DISTINCT o.id),
    COUNT(*) FILTER (WHERE b.is_void = TRUE)
  INTO v_revenue, v_orders, v_voids
  FROM public.orders o
  JOIN public.bills b ON b.order_id = o.id
  WHERE o.branch_id = p_branch_id
    AND o.created_at::DATE = p_date;

  -- top 5 items by qty
  SELECT COALESCE(json_agg(t ORDER BY t.qty DESC), '[]'::json)
  INTO v_top_items
  FROM (
    SELECT mi.name, SUM(oi.qty) AS qty
    FROM public.order_items oi
    JOIN public.orders o      ON o.id  = oi.order_id
    JOIN public.menu_items mi ON mi.id = oi.menu_item_id
    WHERE o.branch_id = p_branch_id AND o.created_at::DATE = p_date
    GROUP BY mi.name
    LIMIT 5
  ) t;

  -- payment breakdown
  SELECT COALESCE(
    json_object_agg(payment_method, total),
    '{}'::json
  ) INTO v_payment
  FROM (
    SELECT b.payment_method, SUM(b.total_amount_paise) AS total
    FROM public.bills b
    JOIN public.orders o ON o.id = b.order_id
    WHERE o.branch_id = p_branch_id AND o.created_at::DATE = p_date
      AND b.is_void = FALSE
    GROUP BY b.payment_method
  ) pm;

  INSERT INTO public.daily_sales_analytics (
    tenant_id, branch_id, date, total_revenue_paise, order_count,
    void_count, top_items, payment_breakdown, computed_at
  ) VALUES (
    v_tenant_id, p_branch_id, p_date, v_revenue, v_orders,
    v_voids, v_top_items, v_payment, NOW()
  )
  ON CONFLICT (branch_id, date)
  DO UPDATE SET
    total_revenue_paise = EXCLUDED.total_revenue_paise,
    order_count         = EXCLUDED.order_count,
    void_count          = EXCLUDED.void_count,
    top_items           = EXCLUDED.top_items,
    payment_breakdown   = EXCLUDED.payment_breakdown,
    computed_at         = NOW();
END;
$$;

COMMIT;
