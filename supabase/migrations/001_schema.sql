-- =========================================================================
-- CafeCanvas — Database Schema Migration
-- Multi-Tenant SaaS Restaurant OS
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- 1. TENANTS (Cafe Businesses)
-- =========================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','growth','enterprise')),
  logo_url TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  currency TEXT DEFAULT 'INR',
  address TEXT,
  phone TEXT,
  gstin TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 2. BRANCHES (Multiple Locations per Tenant)
-- =========================================
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  manager_id UUID,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 3. USERS (Cafe Staff)
-- =========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('owner','manager','cashier','staff','kitchen')),
  pin_hash TEXT,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  fcm_token TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 4. MENU CATEGORIES
-- =========================================
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 5. MENU ITEMS
-- =========================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,  -- stored in paise (₹1 = 100 paise)
  image_url TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','unavailable','hidden')),
  allows_modifiers BOOLEAN DEFAULT false,
  discount_eligible BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  prep_time_min INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 6. MODIFIER GROUPS (e.g. Milk Type, Size)
-- =========================================
CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  min_select INTEGER DEFAULT 0,
  max_select INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 7. MODIFIER OPTIONS
-- =========================================
CREATE TABLE modifier_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  extra_price INTEGER DEFAULT 0, -- stored in paise
  is_default BOOLEAN DEFAULT false
);

-- =========================================
-- 8. TABLES (Floor Layout)
-- =========================================
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 4,
  section TEXT DEFAULT 'indoor',
  shape TEXT DEFAULT 'square' CHECK (shape IN ('square','round','long')),
  status TEXT DEFAULT 'available' CHECK (status IN ('available','occupied','reserved','cleaning')),
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 9. TABLE SESSIONS
-- =========================================
CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  check_in_at TIMESTAMPTZ DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_revenue INTEGER, -- stored in paise
  bill_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 10. ORDERS
-- =========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  table_session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','preparing','ready','served','billed','paid','cancelled')),
  subtotal INTEGER DEFAULT 0, -- paise
  discount_amount INTEGER DEFAULT 0, -- paise
  total INTEGER DEFAULT 0, -- paise
  notes TEXT,
  local_ref TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 11. ORDER ITEMS
-- =========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL, -- paise
  quantity INTEGER NOT NULL DEFAULT 1,
  modifiers JSONB DEFAULT '[]',
  notes TEXT,
  kds_status TEXT DEFAULT 'pending' CHECK (kds_status IN ('pending','preparing','ready','served')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 12. BILLS
-- =========================================
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  order_ids UUID[],
  subtotal INTEGER NOT NULL, -- paise
  tax INTEGER DEFAULT 0, -- paise
  discount_amount INTEGER DEFAULT 0, -- paise
  extra_charges JSONB DEFAULT '[]',
  total INTEGER NOT NULL, -- paise
  status TEXT DEFAULT 'open' CHECK (status IN ('open','paid','voided')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 13. STAFF CALLS
-- =========================================
CREATE TABLE staff_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  session_id UUID,
  called_at TIMESTAMPTZ DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  attended_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','attended','ignored'))
);

-- =========================================
-- 14. CUSTOMERS
-- =========================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  visit_count INTEGER DEFAULT 1,
  total_spend INTEGER DEFAULT 0, -- paise
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 15. DISCOUNTS
-- =========================================
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('percent','flat')),
  value INTEGER NOT NULL, -- percentage or flat amount in paise
  min_order_amount INTEGER DEFAULT 0, -- paise
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all','category','item')),
  target_ids UUID[],
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ
);

-- =========================================
-- 16. COUPONS
-- =========================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  per_user_limit INTEGER DEFAULT 1,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- =========================================
-- 17. STORE SETTINGS
-- =========================================
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  gstin TEXT,
  receipt_header TEXT,
  receipt_footer TEXT DEFAULT 'Thank you! Visit again.',
  cgst_percent NUMERIC(5,2) DEFAULT 2.50,
  sgst_percent NUMERIC(5,2) DEFAULT 2.50,
  service_charge_type TEXT DEFAULT 'percent' CHECK (service_charge_type IN ('percent','flat','none')),
  service_charge_value NUMERIC(10,2) DEFAULT 5.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 18. STOREFRONT CONFIG
-- =========================================
CREATE TABLE storefront_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  theme_id TEXT DEFAULT 'theme-01',
  primary_color TEXT DEFAULT '#6366f1',
  accent_color TEXT DEFAULT '#10b981',
  font_heading TEXT DEFAULT 'Outfit',
  font_body TEXT DEFAULT 'Inter',
  banner_text TEXT,
  show_prices BOOLEAN DEFAULT true,
  allow_orders BOOLEAN DEFAULT true,
  show_blog BOOLEAN DEFAULT true,
  hero_image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 19. BLOGS
-- =========================================
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  hero_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 20. PAYMENT INTEGRATIONS
-- =========================================
CREATE TABLE payment_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_config JSONB,
  is_active BOOLEAN DEFAULT true
);

-- =========================================
-- 21. ATTENDANCE
-- =========================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  check_in_at TIMESTAMPTZ DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT
);

-- =========================================
-- 22. NOTIFICATION LOG
-- =========================================
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- INDEXES FOR SPEED
-- =========================================
CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX idx_menu_items_status ON menu_items(status);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_kds ON order_items(kds_status);
CREATE INDEX idx_bills_tenant_status ON bills(tenant_id, status);
CREATE INDEX idx_tables_tenant_status ON tables(tenant_id, status);
CREATE INDEX idx_staff_calls_table ON staff_calls(table_id, called_at);

-- =========================================
-- CUSTOM AUTH HOOK FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION public.inject_tenant_claims(event JSONB)
RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  user_record users%ROWTYPE;
  claims JSONB;
BEGIN
  SELECT * INTO user_record FROM users WHERE id = (event->>'user_id')::UUID;

  IF user_record.id IS NOT NULL THEN
    claims := event->'claims';
    claims := jsonb_set(claims, '{app_metadata}', jsonb_build_object(
      'tenant_id', user_record.tenant_id,
      'branch_id', user_record.branch_id,
      'role',      user_record.role
    ));
    event := jsonb_set(event, '{claims}', claims);
  END IF;

  RETURN event;
END;
$$;
