-- ================================================================
-- Migration 025: Staff Real-Time Activity Feed
-- ================================================================
BEGIN;

CREATE TABLE public.staff_activity_feed (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id       UUID                 REFERENCES public.branches(id)  ON DELETE SET NULL,
  staff_id        UUID                 REFERENCES public.profiles(id)  ON DELETE SET NULL,
  activity_type   TEXT        NOT NULL CHECK (activity_type IN (
    'clock_in','clock_out',
    'order_created','order_dispatched','order_completed',
    'table_opened','table_closed','table_billed',
    'bill_generated','bill_voided',
    'discount_applied','offer_code_applied',
    'menu_toggled',
    'shift_opened','shift_closed'
  )),
  entity_type     TEXT,
  entity_id       UUID,
  display_text    TEXT,
  metadata        JSONB       NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_tenant  ON public.staff_activity_feed (tenant_id, created_at DESC);
CREATE INDEX idx_activity_branch  ON public.staff_activity_feed (branch_id, created_at DESC);
CREATE INDEX idx_activity_staff   ON public.staff_activity_feed (staff_id,  created_at DESC);
CREATE INDEX idx_activity_type    ON public.staff_activity_feed (tenant_id, activity_type);

ALTER TABLE public.staff_activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity__own_read"
  ON public.staff_activity_feed FOR SELECT
  USING (staff_id = auth.uid());

CREATE POLICY "activity__manager_all_read"
  ON public.staff_activity_feed FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

CREATE POLICY "activity__staff_insert"
  ON public.staff_activity_feed FOR INSERT
  WITH CHECK (
    staff_id  = auth.uid()
    AND tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

COMMIT;
