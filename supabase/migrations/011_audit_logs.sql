-- ================================================================
-- Migration 011: Audit Logging — immutable event trail
-- ================================================================
BEGIN;

CREATE TABLE public.audit_logs (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID          NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id     UUID                   REFERENCES public.branches(id)  ON DELETE SET NULL,
  actor_id      UUID                   REFERENCES auth.users(id)       ON DELETE SET NULL,
  actor_role    TEXT          NOT NULL  CHECK (actor_role IN (
                  'owner','manager','cashier','kitchen','staff','system')),
  action        TEXT          NOT NULL,
  entity_type   TEXT          NOT NULL,
  entity_id     TEXT,
  old_data      JSONB,
  new_data      JSONB,
  metadata      JSONB         NOT NULL DEFAULT '{}',
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_tenant_time   ON public.audit_logs (tenant_id,    created_at DESC);
CREATE INDEX idx_audit_actor         ON public.audit_logs (actor_id,     created_at DESC);
CREATE INDEX idx_audit_entity        ON public.audit_logs (entity_type,  entity_id);
CREATE INDEX idx_audit_action        ON public.audit_logs (action);
CREATE INDEX idx_audit_branch_time   ON public.audit_logs (branch_id,    created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read: owners and managers of the same tenant
CREATE POLICY "audit_logs__owner_manager_can_read"
  ON public.audit_logs FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- Insert: service role only (no RLS bypass needed — service key bypasses all RLS)
-- Intentionally no authenticated-user insert policy → all inserts via admin client

-- No UPDATE or DELETE policies — log is immutable

COMMIT;
