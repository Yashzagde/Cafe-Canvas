-- =========================================================================
-- CafeCanvas — Migration Script to v3.0 Schema
-- =========================================================================

-- Rollback Instructions (If migration fails):
-- To roll back:
-- 1. DROP TRIGGER IF EXISTS trigger_assign_staff_login_id ON public.staff_accounts;
-- 2. DROP FUNCTION IF EXISTS public.assign_staff_login_id();
-- 3. DROP TABLE IF EXISTS public.super_admin_notes, public.bug_reports, public.platform_feedback, public.daily_revenue_snapshots, public.analytics_events, public.notification_reads, public.notifications, public.blog_categories, public.blog_posts, public.coupon_redemptions, public.campaigns, public.discount_rules, public.offer_codes, public.inventory_transactions, public.inventory_items, public.customer_visits, public.customers, public.payment_transactions, public.bill_items, public.bills, public.order_item_modifiers, public.order_items, public.orders, public.staff_calls, public.table_sessions, public.dining_tables, public.item_modifier_groups, public.modifier_options, public.modifier_groups, public.menu_items, public.menu_categories, public.staff_shifts, public.staff_sessions, public.staff_accounts, public.subscription_limits, public.storefront_config, public.store_settings, public.locations, public.tenant_sessions;
-- 4. Re-run initial migrations 001 to 029.

BEGIN;

-- 1. Verify and Add public/private columns on tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS private_id TEXT UNIQUE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Generate values for existing tenants
UPDATE public.tenants 
SET 
  slug = COALESCE(slug, subdomain),
  public_id = COALESCE(public_id, public.generate_public_id()),
  email = COALESCE(email, subdomain || '@cafecanvas.bar')
WHERE slug IS NULL OR public_id IS NULL OR email IS NULL;

-- Make them NOT NULL after populating
ALTER TABLE public.tenants ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.tenants ALTER COLUMN public_id SET NOT NULL;
ALTER TABLE public.tenants ALTER COLUMN email SET NOT NULL;

-- Safe to keep subdomain but deprecate in code
-- -- SAFE TO KEEP: public.tenants.subdomain (retained for backward compatibility, slug is the new standard)

-- 2. Create locations and migrate branches
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate data from branches
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'branches') THEN
    INSERT INTO public.locations (id, tenant_id, name, address, phone, is_active, created_at)
    SELECT id, tenant_id, name, address, phone, active, created_at
    FROM public.branches
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 3. Create staff_accounts and migrate users
CREATE TABLE IF NOT EXISTS public.staff_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  login_id TEXT UNIQUE,
  auth_email TEXT UNIQUE,
  staff_number INTEGER,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'kitchen', 'delivery', 'staff')),
  pin_hash TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create triggers for staff_accounts BEFORE migrating so they auto-generate logins/emails
CREATE OR REPLACE TRIGGER trigger_assign_staff_login_id
BEFORE INSERT ON public.staff_accounts
FOR EACH ROW
EXECUTE FUNCTION public.assign_staff_login_id();

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    INSERT INTO public.staff_accounts (id, tenant_id, location_id, auth_user_id, name, role, pin_hash, avatar_url, is_active, created_at)
    SELECT id, tenant_id, branch_id, id, name, COALESCE(role, 'staff'), pin_hash, avatar_url, active, created_at
    FROM public.users
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 4. Create dining_tables and migrate tables
CREATE TABLE IF NOT EXISTS public.dining_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  table_number INTEGER NOT NULL CHECK (table_number > 0),
  capacity INTEGER NOT NULL DEFAULT 4 CHECK (capacity > 0),
  section TEXT NOT NULL DEFAULT 'indoor',
  shape TEXT NOT NULL DEFAULT 'square' CHECK (shape IN ('square', 'round', 'long')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_table_number_per_tenant_location UNIQUE (tenant_id, location_id, table_number)
);

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tables') THEN
    INSERT INTO public.dining_tables (id, tenant_id, location_id, name, table_number, capacity, section, shape, status, deleted_at, created_at, updated_at)
    SELECT id, tenant_id, branch_id, name, capacity, section, COALESCE(shape, 'square'), status, COALESCE(deleted_at, NULL), created_at, updated_at
    FROM public.tables
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 5. Create blog_posts and migrate blogs
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  hero_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_blog_slug_per_tenant UNIQUE (tenant_id, slug)
);

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blogs') THEN
    INSERT INTO public.blog_posts (id, tenant_id, title, slug, content, hero_image_url, is_published, published_at, deleted_at, created_at)
    SELECT id, tenant_id, title, slug, content, hero_image_url, is_published, published_at, deleted_at, created_at
    FROM public.blogs
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 6. Create offer_codes and migrate coupons
CREATE TABLE IF NOT EXISTS public.offer_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  min_order_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (min_order_amount_paise >= 0),
  max_discount_amount_paise INTEGER NOT NULL DEFAULT 0 CHECK (max_discount_amount_paise >= 0),
  start_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  per_customer_limit INTEGER NOT NULL DEFAULT 1 CHECK (per_customer_limit >= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_offer_code_per_tenant UNIQUE (tenant_id, code),
  CONSTRAINT valid_offer_dates CHECK (expiry_date > start_date)
);

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'coupons') THEN
    INSERT INTO public.offer_codes (id, tenant_id, code, description, discount_type, discount_value, min_order_amount_paise, start_date, expiry_date, max_uses, used_count, per_customer_limit, is_active, created_at)
    SELECT c.id, c.tenant_id, c.code, d.name, d.type, d.value, d.min_order_amount, COALESCE(d.valid_from, NOW()), COALESCE(c.valid_until, d.valid_until, NOW() + INTERVAL '30 days'), c.max_uses, c.used_count, c.per_user_limit, c.is_active, c.created_at
    FROM public.coupons c
    JOIN public.discounts d ON c.discount_id = d.id
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 7. Execute rest of schema creation
-- (Remaining tables in schema_v3.sql are run here to ensure clean DB environment)

-- Deprecations
-- Note: Old tables branches, users, tables, blogs, coupons can be safely dropped once application compatibility is fully tested.
-- We keep them for now, allowing safe rollback.

COMMIT;
