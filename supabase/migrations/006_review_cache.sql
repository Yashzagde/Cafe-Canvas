-- =========================================================================
-- CafeCanvas — Migration 006: Google Review Caching
-- =========================================================================

CREATE TABLE google_review_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  reviews JSONB NOT NULL DEFAULT '[]',
  rating NUMERIC(3,1),
  total_ratings INTEGER,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, place_id)
);

-- Enable RLS
ALTER TABLE google_review_cache ENABLE ROW LEVEL SECURITY;

-- Define Policies
CREATE POLICY "public_read_review_cache" ON google_review_cache
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "manager_write_review_cache" ON google_review_cache
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));
