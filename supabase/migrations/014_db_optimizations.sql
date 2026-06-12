-- migration: 014_db_optimizations.sql
-- Add optimized indexes to improve query latency under multi-tenant scale

-- 1. Index on orders for tenant dashboard filters and history queries
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created_desc 
ON public.orders(tenant_id, created_at DESC);

-- 2. Index on bills for tenant billing and reporting queries
CREATE INDEX IF NOT EXISTS idx_bills_tenant_created_desc 
ON public.bills(tenant_id, created_at DESC);

-- 3. Index on notification_log for real-time unread/read queries
CREATE INDEX IF NOT EXISTS idx_notifications_tenant_read_sent_desc 
ON public.notification_log(tenant_id, read, sent_at DESC);

-- 4. Index on audit_logs for tenant activity history queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created_desc 
ON public.audit_logs(tenant_id, created_at DESC);
