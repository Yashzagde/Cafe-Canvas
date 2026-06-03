-- ================================================================
-- Migration 012: POS Shifts & Cash Management
-- ================================================================
BEGIN;

CREATE TABLE public.pos_shifts (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID          NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id            UUID          NOT NULL REFERENCES public.branches(id)  ON DELETE CASCADE,
  cashier_id           UUID          NOT NULL REFERENCES public.profiles(id)  ON DELETE RESTRICT,
  opened_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  closed_at            TIMESTAMPTZ,
  opening_cash_paise   INTEGER       NOT NULL DEFAULT 0,
  closing_cash_paise   INTEGER,
  expected_cash_paise  INTEGER
    GENERATED ALWAYS AS (
      CASE WHEN closing_cash_paise IS NOT NULL
        THEN opening_cash_paise + closing_cash_paise
        ELSE NULL
      END
    ) STORED,
  variance_paise       INTEGER
    GENERATED ALWAYS AS (
      CASE WHEN closing_cash_paise IS NOT NULL
        THEN closing_cash_paise - (opening_cash_paise + 0)
        ELSE NULL
      END
    ) STORED,
  transaction_count    INTEGER       NOT NULL DEFAULT 0,
  total_sales_paise    INTEGER       NOT NULL DEFAULT 0,
  status               TEXT          NOT NULL DEFAULT 'open'
                         CHECK (status IN ('open','closed','reconciled')),
  notes                TEXT,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT one_open_shift_per_cashier
    EXCLUDE USING gist (cashier_id WITH =, tstzrange(opened_at, COALESCE(closed_at, 'infinity')) WITH &&)
);

CREATE INDEX idx_shifts_tenant_branch ON public.pos_shifts (tenant_id, branch_id, opened_at DESC);
CREATE INDEX idx_shifts_cashier        ON public.pos_shifts (cashier_id, opened_at DESC);
CREATE INDEX idx_shifts_status         ON public.pos_shifts (status) WHERE status = 'open';

ALTER TABLE public.pos_shifts ENABLE ROW LEVEL SECURITY;

-- Staff can see their own shifts
CREATE POLICY "pos_shifts__own_shift_read"
  ON public.pos_shifts FOR SELECT
  USING (cashier_id = auth.uid());

-- Managers and owners see all shifts in tenant
CREATE POLICY "pos_shifts__manager_owner_read"
  ON public.pos_shifts FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- Cashiers can insert their own shifts
CREATE POLICY "pos_shifts__cashier_insert"
  ON public.pos_shifts FOR INSERT
  WITH CHECK (
    cashier_id = auth.uid()
    AND tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Cashiers can close their own open shift; managers can close any
CREATE POLICY "pos_shifts__close_shift"
  ON public.pos_shifts FOR UPDATE
  USING (
    cashier_id = auth.uid()
    OR tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- Helper function: get active shift for current user
CREATE OR REPLACE FUNCTION public.get_active_shift(p_cashier_id UUID)
RETURNS public.pos_shifts
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT * FROM public.pos_shifts
  WHERE cashier_id = p_cashier_id AND status = 'open'
  LIMIT 1;
$$;

COMMIT;
