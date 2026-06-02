-- =========================================================================
-- CafeCanvas — Migration 007: Materialized Analytics Views
-- =========================================================================

-- Drop view if it already exists
DROP MATERIALIZED VIEW IF EXISTS daily_revenue CASCADE;

CREATE MATERIALIZED VIEW daily_revenue AS
SELECT 
  tenant_id,
  DATE(paid_at) as date,
  COUNT(*) as bill_count,
  SUM(total) as total_paise
FROM bills 
WHERE status = 'paid' AND paid_at IS NOT NULL
GROUP BY tenant_id, DATE(paid_at);

-- Create a unique index to allow CONCURRENT refresh
CREATE UNIQUE INDEX idx_daily_revenue_tenant_date ON daily_revenue(tenant_id, date);
