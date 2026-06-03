-- ================================================================
-- Migration 016: Table QR Tokens + Floor Plan Coordinates
-- ================================================================
BEGIN;

ALTER TABLE public.tables
  ADD COLUMN IF NOT EXISTS qr_version      INTEGER      NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS qr_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS floor_x         FLOAT        NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS floor_y         FLOAT        NOT NULL DEFAULT 0;

CREATE INDEX idx_tables_floor ON public.tables (tenant_id, branch_id)
  WHERE floor_x != 0 OR floor_y != 0;

-- Increment qr_version to invalidate all existing QR codes for a table
CREATE OR REPLACE FUNCTION public.invalidate_table_qr(p_table_id UUID)
RETURNS void
LANGUAGE sql SECURITY DEFINER
AS $$
  UPDATE public.tables
  SET    qr_version      = qr_version + 1,
         qr_generated_at = NOW()
  WHERE  id = p_table_id;
$$;

COMMIT;
