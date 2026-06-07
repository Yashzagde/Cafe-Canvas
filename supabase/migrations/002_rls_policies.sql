-- =========================================================================
-- CafeCanvas — Row Level Security Policies
-- =========================================================================

-- Helper function to get current tenant_id from auth JWT app_metadata with staff fallback
CREATE OR REPLACE FUNCTION get_tenant_id()
RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tid UUID;
BEGIN
  SELECT (NULLIF(auth.jwt()->'app_metadata'->>'tenant_id', ''))::UUID INTO tid;
  IF tid IS NULL THEN
    SELECT tenant_id INTO tid FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1;
  END IF;
  RETURN tid;
END;
$$;

-- Helper function to get current location_id from auth JWT app_metadata with staff fallback
CREATE OR REPLACE FUNCTION get_location_id()
RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  lid UUID;
BEGIN
  SELECT (NULLIF(auth.jwt()->'app_metadata'->>'location_id', ''))::UUID INTO lid;
  IF lid IS NULL THEN
    SELECT location_id INTO lid FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1;
  END IF;
  RETURN lid;
END;
$$;

-- Helper function to get current user role from auth JWT app_metadata with staff fallback
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  u_role TEXT;
BEGIN
  SELECT auth.jwt()->'app_metadata'->>'role' INTO u_role;
  IF u_role IS NULL THEN
    SELECT role INTO u_role FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1;
  END IF;
  RETURN u_role;
END;
$$;

-- =========================================
-- Enable RLS on All Active Tables
-- =========================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE storefront_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES DEFINITION
-- =========================================

-- tenants: Staff can read/write their own tenant details
CREATE POLICY "staff_tenant" ON tenants
  FOR ALL TO authenticated
  USING (id = get_tenant_id())
  WITH CHECK (id = get_tenant_id());

-- locations: Staff can view all locations in their tenant, managers/owners write
CREATE POLICY "staff_read_locations" ON locations
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "manager_write_locations" ON locations
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- staff_accounts: Staff can read their own tenant's staff. Manager can perform all operations.
CREATE POLICY "staff_read_accounts" ON staff_accounts
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "staff_read_own_profile" ON staff_accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "manager_write_accounts" ON staff_accounts
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- store_settings: Staff read, managers write
CREATE POLICY "staff_read_settings" ON store_settings
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "manager_write_settings" ON store_settings
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

CREATE POLICY "public_read_settings" ON store_settings
  FOR SELECT TO anon
  USING (true);

-- storefront_config: Public read, managers write
CREATE POLICY "public_read_storefront" ON storefront_config
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "manager_write_storefront" ON storefront_config
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

-- menu_categories: Staff see all, public sees visible categories, owners/managers write
CREATE POLICY "staff_read_categories" ON menu_categories
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_read_categories" ON menu_categories
  FOR SELECT TO anon
  USING (is_visible = true);

CREATE POLICY "manager_write_categories" ON menu_categories
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- menu_items: Staff read/write own tenant. Public read available items.
CREATE POLICY "staff_read_menu" ON menu_items
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_read_available_menu" ON menu_items
  FOR SELECT TO anon
  USING (is_available = true);

CREATE POLICY "manager_write_menu" ON menu_items
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- modifier_groups: Staff read/write, public read
CREATE POLICY "staff_read_groups" ON modifier_groups
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_read_groups" ON modifier_groups
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "manager_write_groups" ON modifier_groups
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- modifier_options: Staff read/write, public read
CREATE POLICY "staff_read_options" ON modifier_options
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "public_read_options" ON modifier_options
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "manager_write_options" ON modifier_options
  FOR ALL TO authenticated
  USING (true);

-- tables: Staff can view and modify floor tables in their tenant
CREATE POLICY "staff_tables" ON tables
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id())
  WITH CHECK (tenant_id = get_tenant_id());

CREATE POLICY "public_read_tables" ON tables
  FOR SELECT TO anon
  USING (is_active = true);

-- table_sessions: Staff have full access, public can insert (on scan check-in)
CREATE POLICY "staff_table_sessions" ON table_sessions
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_insert_table_session" ON table_sessions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_read_table_session" ON table_sessions
  FOR SELECT TO anon
  USING (ended_at IS NULL);

-- orders: Staff see all orders in tenant. Public can read/insert their own table orders.
CREATE POLICY "staff_orders" ON orders
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id())
  WITH CHECK (tenant_id = get_tenant_id());

CREATE POLICY "public_insert_orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_read_orders" ON orders
  FOR SELECT TO anon
  USING (status != 'completed' AND status != 'cancelled');

-- order_items: Staff see all. Public can read/insert order items.
CREATE POLICY "staff_order_items" ON order_items
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_insert_order_items" ON order_items
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "public_read_order_items" ON order_items
  FOR SELECT TO anon
  USING (true);

-- bills: Staff see all. Public can read open bills for checkout.
CREATE POLICY "staff_bills" ON bills
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_read_bills" ON bills
  FOR SELECT TO anon
  USING (status = 'unpaid');

-- staff_calls: Staff see all calls. Public/Anon can insert new calls.
CREATE POLICY "staff_calls_auth" ON staff_calls
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "anon_insert_call" ON staff_calls
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_read_call" ON staff_calls
  FOR SELECT TO anon
  USING (status = 'pending');

-- customers: Staff have full access
CREATE POLICY "staff_customers" ON customers
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

-- discounts: Staff have full access. Public can view active discounts.
CREATE POLICY "staff_discounts" ON discounts
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_read_discounts" ON discounts
  FOR SELECT TO anon
  USING (is_active = true);

-- coupons: Staff full access. Public can check active coupon codes.
CREATE POLICY "staff_coupons" ON coupons
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());

CREATE POLICY "public_read_coupons" ON coupons
  FOR SELECT TO anon
  USING (is_active = true);

-- notification_log: Staff read logs
CREATE POLICY "staff_notifications" ON notification_log
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());
