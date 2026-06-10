-- =========================================================================
-- CafeCanvas Migration: Modifier Compatibility & Item Association Support
-- =========================================================================

-- 1. Rename existing modifier_groups table to modifier_groups_table
ALTER TABLE IF EXISTS public.modifier_groups RENAME TO modifier_groups_table;

-- 2. Add compatibility columns to modifier_groups_table
ALTER TABLE public.modifier_groups_table 
  ADD COLUMN IF NOT EXISTS selection_type TEXT,
  ADD COLUMN IF NOT EXISTS min_selections INTEGER,
  ADD COLUMN IF NOT EXISTS max_selections INTEGER,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 3. Add compatibility columns to modifier_options table
ALTER TABLE public.modifier_options 
  ADD COLUMN IF NOT EXISTS price_delta_paise INTEGER,
  ADD COLUMN IF NOT EXISTS extra_price INTEGER,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 4. Create junction table menu_item_modifier_groups
CREATE TABLE IF NOT EXISTS public.menu_item_modifier_groups (
  item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  modifier_group_id UUID REFERENCES public.modifier_groups_table(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_required BOOLEAN DEFAULT false NOT NULL,
  PRIMARY KEY (item_id, modifier_group_id)
);

-- 5. Create writeable Compatibility View public.modifier_groups
CREATE OR REPLACE VIEW public.modifier_groups WITH (security_invoker = true) AS
SELECT 
  mg.id,
  mg.tenant_id,
  mg.name,
  mg.selection_type,
  mg.min_selections,
  mg.max_selections,
  mg.sort_order,
  mg.created_at,
  mg.min_select,
  mg.max_select,
  mg.is_required,
  mimg.item_id
FROM public.modifier_groups_table mg
LEFT JOIN public.menu_item_modifier_groups mimg ON mg.id = mimg.modifier_group_id;

-- 6. Trigger to sync modifier_groups_table columns (min_select <-> min_selections etc.)
CREATE OR REPLACE FUNCTION public.sync_modifier_groups_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync min_select / min_selections
  IF NEW.min_selections IS NOT NULL THEN
    NEW.min_select := NEW.min_selections;
  ELSIF NEW.min_select IS NOT NULL THEN
    NEW.min_selections := NEW.min_select;
  ELSE
    NEW.min_select := 0;
    NEW.min_selections := 0;
  END IF;

  -- Sync max_select / max_selections
  IF NEW.max_selections IS NOT NULL THEN
    NEW.max_select := NEW.max_selections;
  ELSIF NEW.max_select IS NOT NULL THEN
    NEW.max_selections := NEW.max_select;
  ELSE
    NEW.max_select := 1;
    NEW.max_selections := 1;
  END IF;

  -- Sync is_required
  IF NEW.min_select > 0 THEN
    NEW.is_required := TRUE;
  ELSE
    NEW.is_required := FALSE;
  END IF;

  -- Sync selection_type based on min/max selections
  IF NEW.selection_type IS NULL THEN
    IF NEW.min_select = 1 AND NEW.max_select = 1 THEN
      NEW.selection_type := 'required_single';
    ELSIF NEW.min_select = 0 AND NEW.max_select = 1 THEN
      NEW.selection_type := 'optional_single';
    ELSE
      NEW.selection_type := 'multi_select';
    END IF;
  ELSE
    -- Sync back to min_select / max_select based on type if not explicitly overridden
    IF NEW.selection_type = 'required_single' THEN
      NEW.min_select := 1;
      NEW.min_selections := 1;
      NEW.max_select := 1;
      NEW.max_selections := 1;
    ELSIF NEW.selection_type = 'optional_single' THEN
      NEW.min_select := 0;
      NEW.min_selections := 0;
      NEW.max_select := 1;
      NEW.max_selections := 1;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_modifier_groups
BEFORE INSERT OR UPDATE ON public.modifier_groups_table
FOR EACH ROW EXECUTE FUNCTION public.sync_modifier_groups_fields();

-- 7. Trigger to sync modifier_options columns (price <-> price_delta_paise <-> extra_price)
CREATE OR REPLACE FUNCTION public.sync_modifier_options_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-resolve tenant_id from modifier_groups_table if not supplied
  IF NEW.tenant_id IS NULL THEN
    SELECT tenant_id INTO NEW.tenant_id 
    FROM public.modifier_groups_table 
    WHERE id = NEW.group_id;
  END IF;

  -- Sync prices
  IF NEW.price IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.price IS DISTINCT FROM OLD.price) THEN
    NEW.price_delta_paise := NEW.price;
    NEW.extra_price := NEW.price;
  ELSIF NEW.price_delta_paise IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.price_delta_paise IS DISTINCT FROM OLD.price_delta_paise) THEN
    NEW.price := NEW.price_delta_paise;
    NEW.extra_price := NEW.price_delta_paise;
  ELSIF NEW.extra_price IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.extra_price IS DISTINCT FROM OLD.extra_price) THEN
    NEW.price := NEW.extra_price;
    NEW.price_delta_paise := NEW.extra_price;
  ELSE
    NEW.price := 0;
    NEW.price_delta_paise := 0;
    NEW.extra_price := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_modifier_options
BEFORE INSERT OR UPDATE ON public.modifier_options
FOR EACH ROW EXECUTE FUNCTION public.sync_modifier_options_fields();

-- 8. INSTEAD OF triggers for writeable public.modifier_groups view
CREATE OR REPLACE FUNCTION public.handle_modifier_groups_view_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id UUID;
BEGIN
  v_group_id := COALESCE(NEW.id, gen_random_uuid());

  INSERT INTO public.modifier_groups_table (
    id, tenant_id, name, selection_type, min_selections, max_selections, sort_order, min_select, max_select, is_required
  ) VALUES (
    v_group_id,
    NEW.tenant_id,
    NEW.name,
    NEW.selection_type,
    NEW.min_selections,
    NEW.max_selections,
    NEW.sort_order,
    NEW.min_select,
    NEW.max_select,
    NEW.is_required
  );

  -- Link to menu item if item_id is provided in the insert statement
  IF NEW.item_id IS NOT NULL THEN
    INSERT INTO public.menu_item_modifier_groups (item_id, modifier_group_id, is_required)
    VALUES (NEW.item_id, v_group_id, COALESCE(NEW.is_required, FALSE))
    ON CONFLICT (item_id, modifier_group_id) DO NOTHING;
  END IF;

  NEW.id := v_group_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_modifier_groups_view_insert
INSTEAD OF INSERT ON public.modifier_groups
FOR EACH ROW EXECUTE FUNCTION public.handle_modifier_groups_view_insert();

CREATE OR REPLACE FUNCTION public.handle_modifier_groups_view_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.modifier_groups_table SET
    name = NEW.name,
    selection_type = NEW.selection_type,
    min_selections = NEW.min_selections,
    max_selections = NEW.max_selections,
    sort_order = NEW.sort_order,
    min_select = NEW.min_select,
    max_select = NEW.max_select,
    is_required = NEW.is_required
  WHERE id = OLD.id;

  -- Update link relation if item_id changed
  IF NEW.item_id IS DISTINCT FROM OLD.item_id THEN
    IF OLD.item_id IS NOT NULL THEN
      DELETE FROM public.menu_item_modifier_groups 
      WHERE item_id = OLD.item_id AND modifier_group_id = OLD.id;
    END IF;
    IF NEW.item_id IS NOT NULL THEN
      INSERT INTO public.menu_item_modifier_groups (item_id, modifier_group_id, is_required)
      VALUES (NEW.item_id, OLD.id, COALESCE(NEW.is_required, FALSE))
      ON CONFLICT (item_id, modifier_group_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_modifier_groups_view_update
INSTEAD OF UPDATE ON public.modifier_groups
FOR EACH ROW EXECUTE FUNCTION public.handle_modifier_groups_view_update();

CREATE OR REPLACE FUNCTION public.handle_modifier_groups_view_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.modifier_groups_table WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_modifier_groups_view_delete
INSTEAD OF DELETE ON public.modifier_groups
FOR EACH ROW EXECUTE FUNCTION public.handle_modifier_groups_view_delete();

-- 9. Row Level Security & Policies
ALTER TABLE public.modifier_groups_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_modifier_groups ENABLE ROW LEVEL SECURITY;

-- Recreate policies on renamed table modifier_groups_table
DROP POLICY IF EXISTS "staff_read_groups" ON public.modifier_groups_table;
CREATE POLICY "staff_read_groups" ON public.modifier_groups_table
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "public_read_groups" ON public.modifier_groups_table;
CREATE POLICY "public_read_groups" ON public.modifier_groups_table
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "manager_write_groups" ON public.modifier_groups_table;
CREATE POLICY "manager_write_groups" ON public.modifier_groups_table
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- Add RLS policies for menu_item_modifier_groups
CREATE POLICY "staff_read_item_groups" ON public.menu_item_modifier_groups
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "public_read_item_groups" ON public.menu_item_modifier_groups
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "manager_write_item_groups" ON public.menu_item_modifier_groups
  FOR ALL TO authenticated
  USING (true);
