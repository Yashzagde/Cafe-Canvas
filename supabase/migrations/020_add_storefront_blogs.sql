-- Migration 020: Create storefront_blogs table
CREATE TABLE IF NOT EXISTS public.storefront_blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author TEXT NOT NULL DEFAULT 'Chef Barista',
  tags TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.storefront_blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public select by tenant_id" ON public.storefront_blogs;
DROP POLICY IF EXISTS "Allow staff insert" ON public.storefront_blogs;
DROP POLICY IF EXISTS "Allow staff update" ON public.storefront_blogs;
DROP POLICY IF EXISTS "Allow staff delete" ON public.storefront_blogs;

-- Create RLS Policies
CREATE POLICY "Allow public select by tenant_id" ON public.storefront_blogs
  FOR SELECT USING (true);

CREATE POLICY "Allow staff insert" ON public.storefront_blogs
  FOR INSERT WITH CHECK (tenant_id = get_tenant_id());

CREATE POLICY "Allow staff update" ON public.storefront_blogs
  FOR UPDATE USING (tenant_id = get_tenant_id());

CREATE POLICY "Allow staff delete" ON public.storefront_blogs
  FOR DELETE USING (tenant_id = get_tenant_id());

-- Enable publication/realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.storefront_blogs;
