-- ================================================================
-- Migration 024: Storefront Draft → Publish Workflow
-- ================================================================
BEGIN;

-- Extend existing storefront_settings table
ALTER TABLE public.storefront_settings
  ADD COLUMN IF NOT EXISTS draft_settings      JSONB       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_settings  JSONB       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_version   INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS published_by        UUID                 REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_published        BOOLEAN     NOT NULL DEFAULT FALSE;

-- Migrate existing settings → draft_settings (for existing tenants)
UPDATE public.storefront_settings
SET    draft_settings     = COALESCE(settings, '{}'),
       published_settings = COALESCE(settings, '{}'),
       is_published       = TRUE
WHERE  settings IS NOT NULL AND settings != '{}';

-- Publish history: immutable audit trail of every publish action
CREATE TABLE public.storefront_publish_history (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  settings_snapshot JSONB       NOT NULL,
  version           INTEGER     NOT NULL,
  published_by      UUID                 REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note              TEXT,
  UNIQUE (tenant_id, version)
);

CREATE INDEX idx_publish_history_tenant ON public.storefront_publish_history (tenant_id, published_at DESC);

ALTER TABLE public.storefront_publish_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publish_history__owner_manager"
  ON public.storefront_publish_history FOR SELECT
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- RPC: publish_storefront — atomically promotes draft to published
CREATE OR REPLACE FUNCTION public.publish_storefront(
  p_tenant_id    UUID,
  p_publisher_id UUID,
  p_note         TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_draft   JSONB;
  v_version INTEGER;
BEGIN
  SELECT draft_settings, published_version + 1
  INTO   v_draft, v_version
  FROM   public.storefront_settings
  WHERE  tenant_id = p_tenant_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No storefront settings for tenant %', p_tenant_id;
  END IF;

  IF v_draft = '{}'::JSONB OR v_draft IS NULL THEN
    RAISE EXCEPTION 'Draft settings are empty — nothing to publish';
  END IF;

  UPDATE public.storefront_settings
  SET    published_settings = v_draft,
         published_at       = NOW(),
         published_version  = v_version,
         published_by       = p_publisher_id,
         is_published       = TRUE,
         updated_at         = NOW()
  WHERE  tenant_id = p_tenant_id;

  INSERT INTO public.storefront_publish_history
    (tenant_id, settings_snapshot, version, published_by, note)
  VALUES
    (p_tenant_id, v_draft, v_version, p_publisher_id, p_note);

  RETURN jsonb_build_object('version', v_version, 'published_at', NOW()::TEXT);
END;
$$;

-- RPC: rollback_storefront — restore a previous published version
CREATE OR REPLACE FUNCTION public.rollback_storefront(
  p_tenant_id    UUID,
  p_version      INTEGER,
  p_publisher_id UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_snapshot JSONB;
  v_version  INTEGER;
BEGIN
  SELECT settings_snapshot INTO v_snapshot
  FROM   public.storefront_publish_history
  WHERE  tenant_id = p_tenant_id AND version = p_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Version % not found in publish history', p_version;
  END IF;

  SELECT published_version + 1 INTO v_version
  FROM   public.storefront_settings WHERE tenant_id = p_tenant_id;

  UPDATE public.storefront_settings
  SET    draft_settings     = v_snapshot,
         published_settings = v_snapshot,
         published_version  = v_version,
         published_by       = p_publisher_id,
         published_at       = NOW()
  WHERE  tenant_id = p_tenant_id;

  INSERT INTO public.storefront_publish_history
    (tenant_id, settings_snapshot, version, published_by, note)
  VALUES
    (p_tenant_id, v_snapshot, v_version, p_publisher_id,
     format('Rollback to version %s', p_version));

  RETURN jsonb_build_object('version', v_version, 'rolled_back_to', p_version);
END;
$$;

COMMIT;
