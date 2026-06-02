-- =========================================================================
-- CafeCanvas — Migration 005: Advanced Blogs Schema
-- =========================================================================

-- Drop existing blogs table if it exists to clean up
DROP TABLE IF EXISTS blogs CASCADE;

CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_name TEXT,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Enable RLS on the new table
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies for blogs
CREATE POLICY "public_read_blogs" ON blogs
  FOR SELECT TO anon
  USING (is_published = true);

CREATE POLICY "staff_blogs" ON blogs
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id());
