-- ================================================================
-- Migration 017: Inventory & Recipes
-- ================================================================
BEGIN;

CREATE TABLE public.inventory_items (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID    NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id             UUID    NOT NULL REFERENCES public.branches(id)  ON DELETE CASCADE,
  name                  TEXT    NOT NULL,
  unit                  TEXT    NOT NULL DEFAULT 'unit'
                          CHECK (unit IN ('kg','g','l','ml','unit','dozen','box')),
  quantity              NUMERIC(12,4) NOT NULL DEFAULT 0,
  low_stock_threshold   NUMERIC(12,4) NOT NULL DEFAULT 0,
  cost_per_unit_paise   INTEGER NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, branch_id, name)
);

CREATE INDEX idx_inventory_branch ON public.inventory_items (branch_id);

CREATE TABLE public.recipes (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id      UUID          NOT NULL REFERENCES public.menu_items(id)       ON DELETE CASCADE,
  inventory_item_id UUID          NOT NULL REFERENCES public.inventory_items(id)  ON DELETE CASCADE,
  quantity_used     NUMERIC(12,4) NOT NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (menu_item_id, inventory_item_id)
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory__manager_owner"
  ON public.inventory_items FOR ALL
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

CREATE POLICY "recipes__manager_owner"
  ON public.recipes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.menu_items mi
      JOIN public.profiles p ON p.tenant_id = mi.tenant_id
      WHERE mi.id = recipes.menu_item_id
        AND p.id = auth.uid()
        AND p.role IN ('owner','manager')
    )
  );

COMMIT;
