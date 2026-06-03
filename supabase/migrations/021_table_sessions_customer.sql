-- ================================================================
-- Migration 021: Table Sessions + Temporary Customer Accounts
-- ================================================================
BEGIN;

-- Table dining sessions (one active session per table at a time)
CREATE TABLE public.table_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES public.tenants(id)    ON DELETE CASCADE,
  branch_id       UUID        NOT NULL REFERENCES public.branches(id)   ON DELETE CASCADE,
  table_id        UUID        NOT NULL REFERENCES public.tables(id)     ON DELETE RESTRICT,
  opened_by       UUID        NOT NULL REFERENCES public.profiles(id)   ON DELETE RESTRICT,
  closed_by       UUID                 REFERENCES public.profiles(id)   ON DELETE SET NULL,
  customer_count  INTEGER     NOT NULL  DEFAULT 1
                    CHECK (customer_count BETWEEN 1 AND 100),
  status          TEXT        NOT NULL  DEFAULT 'active'
                    CHECK (status IN ('active','billing','closed','voided')),
  session_start   TIMESTAMPTZ NOT NULL  DEFAULT NOW(),
  session_end     TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL  DEFAULT NOW(),
  CONSTRAINT session_end_after_start CHECK (session_end IS NULL OR session_end > session_start)
);

CREATE UNIQUE INDEX idx_one_active_session_per_table
  ON public.table_sessions (table_id)
  WHERE status = 'active';

CREATE INDEX idx_sessions_branch   ON public.table_sessions (branch_id, session_start DESC);
CREATE INDEX idx_sessions_tenant   ON public.table_sessions (tenant_id, session_start DESC);
CREATE INDEX idx_sessions_opened   ON public.table_sessions (opened_by, session_start DESC);

ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "table_sessions__tenant_staff_read"
  ON public.table_sessions FOR SELECT
  USING (tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid()));

CREATE POLICY "table_sessions__staff_create"
  ON public.table_sessions FOR INSERT
  WITH CHECK (
    opened_by = auth.uid()
    AND tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "table_sessions__staff_update"
  ON public.table_sessions FOR UPDATE
  USING (tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid()));

-- Temporary customer accounts (optional per dining session)
CREATE TABLE public.customer_sessions (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID        NOT NULL REFERENCES public.tenants(id)         ON DELETE CASCADE,
  table_session_id  UUID        NOT NULL REFERENCES public.table_sessions(id)  ON DELETE CASCADE,
  name              TEXT,
  phone             TEXT,
  is_loyalty_member BOOLEAN     NOT NULL DEFAULT FALSE,
  total_spent_paise INTEGER     NOT NULL DEFAULT 0 CHECK (total_spent_paise >= 0),
  visit_count       INTEGER     NOT NULL DEFAULT 1 CHECK (visit_count >= 1),
  preferences       JSONB       NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^[0-9\+\-\s]{7,15}$')
);

CREATE INDEX idx_customer_sessions_tenant ON public.customer_sessions (tenant_id);
CREATE INDEX idx_customer_sessions_phone  ON public.customer_sessions (tenant_id, phone)
  WHERE phone IS NOT NULL;

ALTER TABLE public.customer_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_sessions__tenant_all"
  ON public.customer_sessions FOR ALL
  USING (tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid()))
  WITH CHECK (tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid()));

-- Lookup customer by phone within tenant (for loyalty check)
CREATE OR REPLACE FUNCTION public.lookup_customer_by_phone(
  p_tenant_id UUID,
  p_phone     TEXT
) RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'found',             TRUE,
    'total_spent_paise', SUM(cs.total_spent_paise),
    'visit_count',       SUM(cs.visit_count),
    'is_loyalty',        bool_or(cs.is_loyalty_member),
    'name',              MAX(cs.name)
  ) INTO v_result
  FROM public.customer_sessions cs
  WHERE cs.tenant_id = p_tenant_id
    AND cs.phone = p_phone;

  RETURN COALESCE(v_result, jsonb_build_object('found', FALSE));
END;
$$;

COMMIT;
