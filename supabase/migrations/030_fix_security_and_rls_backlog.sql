-- Migration 030: Fix Security and RLS Backlog
-- Address RLS scoping on modifier_options and secure store_settings.

-- 1. Secure modifier_options RLS policies
DROP POLICY IF EXISTS "staff_read_options" ON public.modifier_options;
DROP POLICY IF EXISTS "public_read_options" ON public.modifier_options;
DROP POLICY IF EXISTS "manager_write_options" ON public.modifier_options;

-- Staff read policy (scoped to tenant via modifier_groups)
CREATE POLICY "staff_read_options" ON public.modifier_options
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.modifier_groups 
      WHERE modifier_groups.id = modifier_options.group_id 
        AND modifier_groups.tenant_id = get_tenant_id()
    )
  );

-- Public read policy for anonymous users (scoped to make sure parent group exists)
CREATE POLICY "public_read_options" ON public.modifier_options
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.modifier_groups 
      WHERE modifier_groups.id = modifier_options.group_id
    )
  );

-- Manager write policy (scoped to tenant and roles via modifier_groups)
CREATE POLICY "manager_write_options" ON public.modifier_options
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.modifier_groups 
      WHERE modifier_groups.id = modifier_options.group_id 
        AND modifier_groups.tenant_id = get_tenant_id()
        AND get_user_role() IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.modifier_groups 
      WHERE modifier_groups.id = modifier_options.group_id 
        AND modifier_groups.tenant_id = get_tenant_id()
        AND get_user_role() IN ('owner', 'manager')
    )
  );


-- 2. Secure store_settings RLS policies (Drop public anon read)
DROP POLICY IF EXISTS "public_read_settings" ON public.store_settings;
