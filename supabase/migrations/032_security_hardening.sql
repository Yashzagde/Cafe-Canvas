-- ============================================================
-- CAFE CANVAS — 032_security_hardening.sql
-- Resolves Supabase Database Linter Warnings
-- ============================================================

-- ── 1. FIX FUNCTION SEARCH PATH MUTABILITY ───────────────────
ALTER FUNCTION public.generate_public_id_text() SET search_path = public;
ALTER FUNCTION public.auto_generate_public_id() SET search_path = public;
ALTER FUNCTION public.auto_assign_private_id() SET search_path = public;
ALTER FUNCTION public.sync_modifier_options_fields() SET search_path = public;
ALTER FUNCTION public.revoke_other_tenant_sessions(uuid, text) SET search_path = public;
ALTER FUNCTION public.check_staff_limit() SET search_path = public;
ALTER FUNCTION public.handle_users_view_delete() SET search_path = public;
ALTER FUNCTION public.handle_branches_view_insert() SET search_path = public;
ALTER FUNCTION public.handle_branches_view_update() SET search_path = public;
ALTER FUNCTION public.handle_branches_view_delete() SET search_path = public;
ALTER FUNCTION public.handle_users_view_insert() SET search_path = public;
ALTER FUNCTION public.handle_users_view_update() SET search_path = public;
ALTER FUNCTION public.sync_tables_compatibility_fields() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.notify_push_notification_webhook() SET search_path = public;
ALTER FUNCTION public.request_customer_otp(text, uuid) SET search_path = public;
ALTER FUNCTION public.verify_customer_otp_and_checkin(text, text, uuid, boolean) SET search_path = public;
ALTER FUNCTION public.clock_in_staff(uuid, uuid, double precision, double precision, text, text, text) SET search_path = public;
ALTER FUNCTION public.clock_out_staff(uuid, double precision, double precision, text) SET search_path = public;
ALTER FUNCTION public.get_tenant_id() SET search_path = public;
ALTER FUNCTION public.get_location_id() SET search_path = public;
ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.inject_tenant_claims(jsonb) SET search_path = public;

-- ── 2. REMOVE OVERLY PERMISSIVE RLS POLICIES ────────────────
-- customers: anon_insert_customers
DROP POLICY IF EXISTS "anon_insert_customers" ON public.customers;
CREATE POLICY "anon_insert_customers" ON public.customers
  FOR INSERT TO anon
  WITH CHECK (tenant_id IS NOT NULL AND phone IS NOT NULL);

-- menu_item_modifier_groups: manager_write_item_groups
DROP POLICY IF EXISTS "manager_write_item_groups" ON public.menu_item_modifier_groups;
CREATE POLICY "manager_write_item_groups" ON public.menu_item_modifier_groups
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.menu_items 
    WHERE menu_items.id = menu_item_modifier_groups.item_id 
      AND menu_items.tenant_id = get_tenant_id()
  ));

-- order_item_modifiers: public_insert_order_modifiers
DROP POLICY IF EXISTS "public_insert_order_modifiers" ON public.order_item_modifiers;
CREATE POLICY "public_insert_order_modifiers" ON public.order_item_modifiers
  FOR INSERT TO anon
  WITH CHECK (tenant_id IS NOT NULL AND order_item_id IS NOT NULL);

-- order_items: public_insert_order_items
DROP POLICY IF EXISTS "public_insert_order_items" ON public.order_items;
CREATE POLICY "public_insert_order_items" ON public.order_items
  FOR INSERT TO anon
  WITH CHECK (tenant_id IS NOT NULL AND order_id IS NOT NULL);

-- orders: public_insert_orders
DROP POLICY IF EXISTS "public_insert_orders" ON public.orders;
CREATE POLICY "public_insert_orders" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (tenant_id IS NOT NULL AND table_id IS NOT NULL);

-- staff_calls: anon_insert_call
DROP POLICY IF EXISTS "anon_insert_call" ON public.staff_calls;
CREATE POLICY "anon_insert_call" ON public.staff_calls
  FOR INSERT TO anon
  WITH CHECK (tenant_id IS NOT NULL AND table_id IS NOT NULL);

-- table_sessions: public_insert_table_session
DROP POLICY IF EXISTS "public_insert_table_session" ON public.table_sessions;
CREATE POLICY "public_insert_table_session" ON public.table_sessions
  FOR INSERT TO anon
  WITH CHECK (tenant_id IS NOT NULL AND table_id IS NOT NULL);


-- ── 3. SECURE FUNCTION EXECUTE PERMISSIONS ──────────────────

-- Revoke default public execution rights
REVOKE EXECUTE ON FUNCTION public.get_tenant_id() FROM public;
REVOKE EXECUTE ON FUNCTION public.get_location_id() FROM public;
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM public;

-- Grant execution explicitly to authenticated & anon roles (since they query tables with RLS calling these)
GRANT EXECUTE ON FUNCTION public.get_tenant_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_location_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, anon;

-- staff clock-in/out: only authenticated staff
REVOKE EXECUTE ON FUNCTION public.clock_in_staff(uuid, uuid, double precision, double precision, text, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.clock_in_staff(uuid, uuid, double precision, double precision, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.clock_out_staff(uuid, double precision, double precision, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.clock_out_staff(uuid, double precision, double precision, text) TO authenticated;

-- inject_tenant_claims (JWT claim hook): only callable by GoTrue auth admin
REVOKE EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO supabase_auth_admin;

-- revoke_other_tenant_sessions: only authenticated staff
REVOKE EXECUTE ON FUNCTION public.revoke_other_tenant_sessions(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.revoke_other_tenant_sessions(uuid, text) TO authenticated;

-- request/verify customer OTP: callable by anonymous storefront and authenticated staff
REVOKE EXECUTE ON FUNCTION public.request_customer_otp(text, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.request_customer_otp(text, uuid) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.verify_customer_otp_and_checkin(text, text, uuid, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_customer_otp_and_checkin(text, text, uuid, boolean) TO anon, authenticated;

-- Triggers & System Internal Functions: revoke from public/anon/authenticated entirely
REVOKE EXECUTE ON FUNCTION public.sync_modifier_options_fields() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_notification_webhook() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_tables_compatibility_fields() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_users_view_delete() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_branches_view_insert() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_branches_view_update() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_branches_view_delete() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_users_view_insert() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_users_view_update() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM public, anon, authenticated;
