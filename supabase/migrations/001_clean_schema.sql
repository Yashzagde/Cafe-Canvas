-- =========================================================================
-- CafeCanvas — Canonical Clean Multi-Tenant SaaS Database Schema
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANTS (SaaS Store Accounts)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- Used in storefront subdomains (e.g. {slug}.cafecanvas.bar)
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

-- 2. LOCATIONS (Branches under a Tenant)
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

-- 3. STAFF ACCOUNTS (Sub-accounts under a Tenant branch, capped at 50 per tenant)
CREATE TABLE staff_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'staff', -- Supports custom roles: owner, manager, admin, cashier, waiter, chef, bartender, etc.
  pin TEXT,
  fcm_token TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STORE SETTINGS (Taxes and receipt configs)
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

-- 5. STOREFRONT CONFIG (Digital menu theme & layout configs)
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
  show_blog BOOLEAN DEFAULT false,
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

-- 7. MENU ITEMS (Prices stored in Paise)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_hi TEXT,
  description TEXT,
  price INTEGER NOT NULL, -- Stored in paise (1 INR = 100 paise)
  compare_price INTEGER, -- Stored in paise
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
  price INTEGER DEFAULT 0, -- In paise
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLES
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  branch_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  table_number INTEGER,
  name TEXT,
  capacity INTEGER DEFAULT 4,
  section TEXT,
  qr_token TEXT,
  status TEXT DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'dirty', 'reserved', 'cleaning')),
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  floor_x INTEGER,
  floor_y INTEGER,
  qr_version INTEGER DEFAULT 1,
  qr_generated_at TIMESTAMPTZ DEFAULT NOW(),
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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'billed', 'paid', 'cancelled')),
  order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  subtotal INTEGER NOT NULL, -- Paise
  tax_amount INTEGER DEFAULT 0, -- Paise
  discount_amount INTEGER DEFAULT 0, -- Paise
  total INTEGER NOT NULL, -- Paise
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL, -- Paise
  quantity INTEGER NOT NULL DEFAULT 1,
  modifier_details TEXT,
  modifiers JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. BILLS (Includes customer phone field added in migration 004)
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  order_ids UUID[] DEFAULT '{}'::UUID[],
  table_number INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal INTEGER NOT NULL, -- Paise
  cgst INTEGER DEFAULT 0, -- Paise
  sgst INTEGER DEFAULT 0, -- Paise
  discount_amount INTEGER DEFAULT 0, -- Paise
  total INTEGER NOT NULL, -- Paise
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

-- 16. CUSTOMERS (Loyalty CRM)
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  total_visits INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0, -- Paise
  last_visit_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tenant_id, phone)
);

-- 17. DISCOUNTS (Offers & Promotions)
CREATE TABLE discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('percentage', 'percent', 'flat')),
  value INTEGER NOT NULL, -- flat = Paise, percentage = standard integer rate
  min_order_amount INTEGER DEFAULT 0, -- Paise
  max_discount INTEGER, -- Paise
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. COUPONS
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

-- 19. NOTIFICATION LOG (With read status column added in migration 004)
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- Supports custom types: staff_call, order_status, customer_checkin, etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- DATABASE TRIGGER: ENFORCE STAFF LIMIT (MAX 50 STAFF SUB-ACCOUNTS PER TENANT)
-- =========================================================================

CREATE OR REPLACE FUNCTION public.check_staff_limit()
RETURNS TRIGGER AS $$
DECLARE
  staff_count INTEGER;
BEGIN
  -- Count active staff accounts for the tenant
  SELECT COUNT(*) INTO staff_count 
  FROM public.staff_accounts 
  WHERE tenant_id = NEW.tenant_id;

  IF staff_count >= 50 THEN
    RAISE EXCEPTION 'Maximum limit of 50 staff sub-accounts reached for this tenant.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER enforce_staff_limit
BEFORE INSERT ON public.staff_accounts
FOR EACH ROW EXECUTE FUNCTION public.check_staff_limit();

-- =========================================================================
-- DATABASE TRIGGER: SYNC TABLES COMPATIBILITY FIELDS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.sync_tables_compatibility_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync branch_id and location_id
  IF NEW.branch_id IS NOT NULL AND NEW.location_id IS NULL THEN
    NEW.location_id := NEW.branch_id;
  ELSIF NEW.location_id IS NOT NULL AND NEW.branch_id IS NULL THEN
    NEW.branch_id := NEW.location_id;
  END IF;

  -- Sync name and table_number
  IF NEW.name IS NOT NULL AND NEW.table_number IS NULL THEN
    BEGIN
      NEW.table_number := (REGEXP_REPLACE(NEW.name, '[^0-9]', '', 'g'))::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      NEW.table_number := 0;
    END;
  ELSIF NEW.table_number IS NOT NULL AND NEW.name IS NULL THEN
    NEW.name := NEW.table_number::TEXT;
  END IF;

  -- Sync floor_x/y and position_x/y
  IF NEW.floor_x IS NOT NULL AND NEW.position_x IS NULL THEN
    NEW.position_x := NEW.floor_x;
  ELSIF NEW.position_x IS NOT NULL AND NEW.floor_x IS NULL THEN
    NEW.floor_x := NEW.position_x;
  END IF;

  IF NEW.floor_y IS NOT NULL AND NEW.position_y IS NULL THEN
    NEW.position_y := NEW.floor_y;
  ELSIF NEW.position_y IS NOT NULL AND NEW.floor_y IS NULL THEN
    NEW.floor_y := NEW.position_y;
  END IF;

  -- Fallbacks
  IF NEW.location_id IS NULL THEN
    NEW.location_id := NEW.branch_id;
  END IF;

  IF NEW.table_number IS NULL THEN
    NEW.table_number := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER sync_tables_compatibility_trig
BEFORE INSERT OR UPDATE ON public.tables
FOR EACH ROW EXECUTE FUNCTION public.sync_tables_compatibility_fields();

-- =========================================================================
-- CUSTOM AUTH HOOK FUNCTION (Inject Claims to App Metadata)
-- =========================================================================

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

-- Grant permissions to auth hook
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

-- =========================================================================
-- BACKWARD COMPATIBILITY VIEWS: public.users AND public.branches
-- =========================================================================

-- 1. users Compatibility View
CREATE OR REPLACE VIEW public.users WITH (security_invoker = true) AS
SELECT
  COALESCE(auth_user_id, id) AS id,
  tenant_id,
  location_id AS branch_id,
  full_name AS name,
  email,
  phone,
  role,
  CASE WHEN is_active THEN 'ACTIVE' ELSE 'INACTIVE' END AS status,
  is_active AS active,
  pin AS pin_hash,
  created_at
FROM public.staff_accounts;

-- 2. branches Compatibility View
CREATE OR REPLACE VIEW public.branches WITH (security_invoker = true) AS
SELECT
  id,
  tenant_id,
  name,
  CASE WHEN is_active THEN 'ACTIVE' ELSE 'INACTIVE' END AS status,
  is_active AS active,
  created_at
FROM public.locations;

-- INSTEAD OF triggers for users view
CREATE OR REPLACE FUNCTION public.handle_users_view_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.staff_accounts (
    id, tenant_id, location_id, auth_user_id, full_name, email, phone, role, pin, is_active
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.tenant_id,
    NEW.branch_id,
    NEW.id,
    COALESCE(NEW.name, NEW.full_name),
    NEW.email,
    NEW.phone,
    NEW.role,
    NEW.pin_hash,
    COALESCE(NEW.active, NEW.status = 'ACTIVE', TRUE)
  )
  ON CONFLICT (id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    location_id = EXCLUDED.location_id,
    auth_user_id = EXCLUDED.auth_user_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    pin = EXCLUDED.pin,
    is_active = EXCLUDED.is_active;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_view_insert_trig
INSTEAD OF INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_users_view_insert();

CREATE OR REPLACE FUNCTION public.handle_users_view_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.staff_accounts SET
    tenant_id = NEW.tenant_id,
    location_id = NEW.branch_id,
    auth_user_id = NEW.id,
    full_name = COALESCE(NEW.name, NEW.full_name),
    email = NEW.email,
    phone = NEW.phone,
    role = NEW.role,
    pin = NEW.pin_hash,
    is_active = COALESCE(NEW.active, NEW.status = 'ACTIVE', TRUE)
  WHERE id = OLD.id OR auth_user_id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_view_update_trig
INSTEAD OF UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_users_view_update();

CREATE OR REPLACE FUNCTION public.handle_users_view_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.staff_accounts WHERE id = OLD.id OR auth_user_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_view_delete_trig
INSTEAD OF DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_users_view_delete();

-- INSTEAD OF triggers for branches view
CREATE OR REPLACE FUNCTION public.handle_branches_view_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.locations (
    id, tenant_id, name, is_active
  ) VALUES (
    COALESCE(NEW.id, gen_random_uuid()),
    NEW.tenant_id,
    NEW.name,
    COALESCE(NEW.status = 'ACTIVE', TRUE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER branches_view_insert_trig
INSTEAD OF INSERT ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.handle_branches_view_insert();

CREATE OR REPLACE FUNCTION public.handle_branches_view_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.locations SET
    tenant_id = NEW.tenant_id,
    name = NEW.name,
    is_active = COALESCE(NEW.status = 'ACTIVE', TRUE)
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER branches_view_update_trig
INSTEAD OF UPDATE ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.handle_branches_view_update();

CREATE OR REPLACE FUNCTION public.handle_branches_view_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.locations WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER branches_view_delete_trig
INSTEAD OF DELETE ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.handle_branches_view_delete();
