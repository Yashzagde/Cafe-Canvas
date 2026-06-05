-- =========================================================================
-- CafeCanvas — Canonical Clean Database Schema
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  logo_url TEXT,
  subscription_tier TEXT DEFAULT 'Free' CHECK (subscription_tier IN ('Free','Pro','Growth','Enterprise')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCATIONS (Branches)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STAFF ACCOUNTS (Users)
CREATE TABLE staff_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('manager','cashier','kitchen','delivery','staff')),
  pin TEXT,
  fcm_token TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORE SETTINGS
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  currency TEXT DEFAULT 'INR',
  tax_cgst INTEGER DEFAULT 250, -- in base points (2.5% = 250)
  tax_sgst INTEGER DEFAULT 250,
  tax_inclusive BOOLEAN DEFAULT false,
  razorpay_key_id TEXT,
  upi_id TEXT,
  open_time TEXT,
  close_time TEXT,
  receipt_header TEXT,
  receipt_footer TEXT DEFAULT 'Thank you! Visit again.',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STOREFRONT CONFIG
CREATE TABLE storefront_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme_id TEXT DEFAULT 'theme-01',
  primary_color TEXT DEFAULT '#ff6b6b',
  accent_color TEXT DEFAULT '#4ecdc4',
  font_heading TEXT DEFAULT 'Outfit',
  font_body TEXT DEFAULT 'Inter',
  banner_text TEXT,
  show_prices BOOLEAN DEFAULT true,
  allow_orders BOOLEAN DEFAULT true,
  show_blog BOOLEAN DEFAULT true,
  hero_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MENU CATEGORIES
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_hi TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MENU ITEMS
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_hi TEXT,
  description TEXT,
  price INTEGER NOT NULL, -- stored in paise (1 INR = 100 paise)
  compare_price INTEGER, -- stored in paise
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  dietary_tags TEXT[] DEFAULT '{}'::TEXT[],
  prep_time_mins INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MODIFIER GROUPS
CREATE TABLE modifier_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  min_select INTEGER DEFAULT 0,
  max_select INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. MODIFIER OPTIONS
CREATE TABLE modifier_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price INTEGER DEFAULT 0, -- in paise
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLES
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  table_number INTEGER NOT NULL,
  name TEXT,
  capacity INTEGER DEFAULT 4,
  section TEXT,
  qr_token TEXT,
  status TEXT DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'dirty', 'reserved', 'cleaning')),
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLE SESSIONS
CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  pax INTEGER DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  order_ids UUID[] DEFAULT '{}'::UUID[]
);

-- 12. ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
  order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  subtotal INTEGER NOT NULL, -- paise
  tax_amount INTEGER DEFAULT 0, -- paise
  discount_amount INTEGER DEFAULT 0, -- paise
  total INTEGER NOT NULL, -- paise
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL, -- Added for analytics queries
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL, -- paise
  quantity INTEGER NOT NULL DEFAULT 1,
  modifier_details TEXT,
  modifiers JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. BILLS
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- single order reference
  order_ids UUID[] DEFAULT '{}'::UUID[],                 -- multiple orders reference
  table_number INTEGER,
  customer_name TEXT,
  subtotal INTEGER NOT NULL, -- paise
  cgst INTEGER DEFAULT 0, -- paise
  sgst INTEGER DEFAULT 0, -- paise
  discount_amount INTEGER DEFAULT 0, -- paise
  total INTEGER NOT NULL, -- paise
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'partially_paid', 'cancelled', 'void')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'card', 'other')),
  created_by UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. STAFF CALLS
CREATE TABLE staff_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE NOT NULL,
  table_number INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CUSTOMERS
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  total_visits INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0, -- paise
  last_visit_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, phone)
);

-- 17. INVENTORY
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT DEFAULT 'pcs',
  current_stock NUMERIC DEFAULT 0,
  reorder_level NUMERIC DEFAULT 10,
  cost_per_unit INTEGER DEFAULT 0, -- paise
  supplier TEXT,
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. DISCOUNTS
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'percent', 'flat')),
  value INTEGER NOT NULL, -- flat = paise, percentage = number
  min_order_amount INTEGER DEFAULT 0, -- paise
  max_discount INTEGER, -- paise
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. COUPONS
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. ATTENDANCE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  staff_id UUID REFERENCES staff_accounts(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. NOTIFICATION LOG
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('staff_call', 'order_status', 'payment_received')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. BLOGS
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  hero_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- CUSTOM AUTH HOOK FUNCTION
-- =========================================
CREATE OR REPLACE FUNCTION public.inject_tenant_claims(event JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  staff_record staff_accounts%ROWTYPE;
BEGIN
  IF (event->>'user_id') IS NOT NULL AND (event->>'user_id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
    -- Look up staff details
    SELECT * INTO staff_record FROM staff_accounts WHERE auth_user_id = (event->>'user_id')::UUID;

    IF staff_record.id IS NOT NULL THEN
      -- Merge claims and app_metadata safely using JSONB merge operator (||)
      event := event || jsonb_build_object(
        'claims', COALESCE(event->'claims', '{}'::jsonb) || jsonb_build_object(
          'app_metadata', COALESCE(event->'claims'->'app_metadata', '{}'::jsonb) || jsonb_build_object(
            'tenant_id', staff_record.tenant_id,
            'location_id', staff_record.location_id,
            'role',      staff_record.role
          )
        )
      );
    END IF;
  END IF;

  RETURN event;
END;
$$;

-- Grant permissions to supabase_auth_admin and other roles for Custom JWT Claims Hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO authenticator;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO authenticator;
GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO PUBLIC;



