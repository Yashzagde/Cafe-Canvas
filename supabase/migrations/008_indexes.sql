-- =========================================================================
-- CafeCanvas — Migration 008: Performance Indexes
-- =========================================================================

-- Drop indexes if they exist to prevent duplication
DROP INDEX IF EXISTS idx_orders_tenant_created;
DROP INDEX IF EXISTS idx_bills_tenant_paid;
DROP INDEX IF EXISTS idx_order_items_order_tenant;
DROP INDEX IF EXISTS idx_menu_items_tenant_category;
DROP INDEX IF EXISTS idx_customers_tenant_phone;
DROP INDEX IF EXISTS idx_tables_tenant_status;

-- Corrected Indexes based on Migration 001 Schema:
CREATE INDEX idx_orders_tenant_created 
  ON orders(tenant_id, created_at DESC);
  
CREATE INDEX idx_bills_tenant_paid 
  ON bills(tenant_id, paid_at DESC) WHERE status = 'paid';

CREATE INDEX idx_order_items_order_id 
  ON order_items(order_id);

CREATE INDEX idx_menu_items_tenant_category 
  ON menu_items(tenant_id, category_id) WHERE status = 'available' AND deleted_at IS NULL;
  
CREATE INDEX idx_customers_tenant_phone 
  ON customers(tenant_id, phone);

CREATE INDEX idx_tables_tenant_status
  ON tables(tenant_id, status) WHERE deleted_at IS NULL;
