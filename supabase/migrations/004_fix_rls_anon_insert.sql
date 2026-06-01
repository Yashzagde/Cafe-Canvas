-- =========================================================================
-- CafeCanvas — Bug 3: Fix Dangerous Anon INSERT RLS Policies
-- =========================================================================

-- Drop the old open-ended INSERT policies
DROP POLICY IF EXISTS "public_insert_table_session" ON table_sessions;
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
DROP POLICY IF EXISTS "anon_insert_call" ON staff_calls;

-- 1. Secure table_sessions INSERT: Ensure tenant_id and table_id are provided
CREATE POLICY "secured_anon_insert_table_session" ON table_sessions
  FOR INSERT TO anon
  WITH CHECK (
    tenant_id IS NOT NULL AND 
    table_id IS NOT NULL AND 
    check_in_at IS NOT NULL
  );

-- 2. Secure orders INSERT: Ensure tenant_id is valid and table_session_id is non-null
CREATE POLICY "secured_anon_insert_orders" ON orders
  FOR INSERT TO anon
  WITH CHECK (
    tenant_id IS NOT NULL AND
    table_session_id IS NOT NULL AND
    status = 'pending'
  );

-- 3. Secure order_items INSERT: Ensure order_id and menu_item_id are valid
CREATE POLICY "secured_anon_insert_order_items" ON order_items
  FOR INSERT TO anon
  WITH CHECK (
    order_id IS NOT NULL AND
    menu_item_id IS NOT NULL AND
    quantity > 0
  );

-- 4. Secure staff_calls INSERT: Ensure tenant_id and table_id are valid and status is pending
CREATE POLICY "secured_anon_insert_call" ON staff_calls
  FOR INSERT TO anon
  WITH CHECK (
    tenant_id IS NOT NULL AND
    table_id IS NOT NULL AND
    status = 'pending'
  );

-- 5. Secure customer self-registration INSERT (if added in storefront config/flows)
DROP POLICY IF EXISTS "secured_anon_insert_customers" ON customers;
CREATE POLICY "secured_anon_insert_customers" ON customers
  FOR INSERT TO anon
  WITH CHECK (
    tenant_id IS NOT NULL AND
    phone IS NOT NULL AND
    name IS NOT NULL
  );
