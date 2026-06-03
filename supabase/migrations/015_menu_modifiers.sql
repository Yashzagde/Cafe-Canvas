-- ================================================================
-- Migration 015: Reusable Menu Modifier Groups
-- DROPS old item-coupled modifier_groups / modifier_options
-- ================================================================
BEGIN;

-- Remove the tightly coupled old tables
DROP TABLE IF EXISTS public.modifier_options  CASCADE;
DROP TABLE IF EXISTS public.modifier_groups   CASCADE;

-- ── Reusable Modifier Groups (tenant-scoped, not item-scoped) ─────
CREATE TABLE public.modifier_groups (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID    NOT NULL REFERENCES public.tenants(id)  ON DELETE CASCADE,
  name            TEXT    NOT NULL,
  selection_type  TEXT    NOT NULL DEFAULT 'optional_single'
                    CHECK (selection_type IN (
                      'required_single',   -- customer must pick exactly 1
                      'optional_single',   -- customer picks 0 or 1
                      'multi_select'       -- customer picks min..max
                    )),
  min_selections  INTEGER NOT NULL DEFAULT 0,
  max_selections  INTEGER NOT NULL DEFAULT 1,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_selection_range CHECK (min_selections <= max_selections),
  CONSTRAINT min_non_negative      CHECK (min_selections >= 0)
);

CREATE INDEX idx_modifier_groups_tenant ON public.modifier_groups (tenant_id);

-- ── Modifier Options ──────────────────────────────────────────────
CREATE TABLE public.modifier_options (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID    NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  tenant_id         UUID    NOT NULL REFERENCES public.tenants(id)         ON DELETE CASCADE,
  name              TEXT    NOT NULL,
  price_delta_paise INTEGER NOT NULL DEFAULT 0,  -- can be negative (discount)
  is_default        BOOLEAN NOT NULL DEFAULT FALSE,
  is_available      BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modifier_options_group ON public.modifier_options (group_id, sort_order);

-- ── Junction: Menu Item ↔ Modifier Groups ────────────────────────
CREATE TABLE public.menu_item_modifier_groups (
  item_id       UUID    NOT NULL REFERENCES public.menu_items(id)       ON DELETE CASCADE,
  group_id      UUID    NOT NULL REFERENCES public.modifier_groups(id)  ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_required   BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (item_id, group_id)
);

CREATE INDEX idx_mimgs_item ON public.menu_item_modifier_groups (item_id,  sort_order);
CREATE INDEX idx_mimgs_group ON public.menu_item_modifier_groups (group_id);

-- ── RLS ──────────────────────────────────────────────────────────

ALTER TABLE public.modifier_groups             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_modifier_groups   ENABLE ROW LEVEL SECURITY;

-- Anonymous storefront: can read all for a tenant
CREATE POLICY "modifier_groups__tenant_read"
  ON public.modifier_groups FOR SELECT USING (TRUE);

CREATE POLICY "modifier_options__tenant_read"
  ON public.modifier_options FOR SELECT USING (TRUE);

CREATE POLICY "mimgs__tenant_read"
  ON public.menu_item_modifier_groups FOR SELECT USING (TRUE);

-- Writes: owner / manager only
CREATE POLICY "modifier_groups__owner_manager_write"
  ON public.modifier_groups FOR ALL
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  )
  WITH CHECK (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

CREATE POLICY "modifier_options__owner_manager_write"
  ON public.modifier_options FOR ALL
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  )
  WITH CHECK (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

COMMIT;
