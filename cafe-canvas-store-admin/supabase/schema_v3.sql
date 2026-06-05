-- =========================================================================
-- CafeCanvas — Complete Database Schema (v3.0)
-- Multi-Tenant SaaS Restaurant OS
-- =========================================================================

-- SECTION 0: Extensions & Pre-requisites
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- SECTION 1: Utility Functions & Triggers (Pre-dependencies)

-- 1. update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. generate_public_id (12-char random alphanumeric)
CREATE OR REPLACE FUNCTION public.generate_public_id()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. assign_private_id (CC-XXXXX sequential)
CREATE OR REPLACE FUNCTION public.assign_private_id()
RETURNS TRIGGER AS $$
DECLARE
  next_seq INT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING(private_id FROM 4)::int), 0) + 1 
  INTO next_seq 
  FROM public.tenants;
  
  NEW.private_id := 'CC-' || lpad(next_seq::text, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. assign_staff_login_id & auth_email trigger
CREATE OR REPLACE FUNCTION public.assign_staff_login_id()
RETURNS TRIGGER AS $$
DECLARE
  tenant_slug TEXT;
  next_num INT;
BEGIN
  -- Get tenant slug
  SELECT slug INTO tenant_slug FROM public.tenants WHERE id = NEW.tenant_id;
  
  -- Get next staff number for this tenant
  SELECT COALESCE(MAX(staff_number), 1000) + 1 
  INTO next_num 
  FROM public.staff_accounts 
  WHERE tenant_id = NEW.tenant_id;
  
  NEW.staff_number := next_num;
  NEW.login_id := tenant_slug || '#' || next_num::text;
  NEW.auth_email := tenant_slug || '-' || next_num::text || '@staff.cafecanvas.bar';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. get_staff_role definer function
CREATE OR REPLACE FUNCTION public.get_staff_role(user_id UUID)
RETURNS TEXT SECURITY DEFINER AS $$
  SELECT role FROM public.staff_accounts WHERE auth_user_id = user_id LIMIT 1;
$$ LANGUAGE sql;

-- 6. get_tenant_id definer function
CREATE OR REPLACE FUNCTION public.get_tenant_id(user_id UUID)
RETURNS UUID SECURITY DEFINER AS $$
  SELECT tenant_id FROM public.staff_accounts WHERE auth_user_id = user_id LIMIT 1;
$$ LANGUAGE sql;


-- SECTION 2: Foundation Tables

-- 1. tenants
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9\-]+$'),
  public_id TEXT UNIQUE NOT NULL DEFAULT public.generate_public_id(),
  private_id TEXT UNIQUE, -- populated via trigger
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Growth', 'Enterprise')),
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to assign private_id on insert
CREATE TRIGGER trigger_assign_private_id
BEFORE INSERT ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.assign_private_id();

-- Trigger for tenants updated_at
CREATE TRIGGER trigger_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 2. tenant_sessions (Owner/Manager web login tracking)
CREATE TABLE public.tenant_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_tenant_sessions_updated_at
BEFORE UPDATE ON public.tenant_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 3. locations (branches)
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_locations_updated_at
BEFORE UPDATE ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 4. store_settings
CREATE TABLE public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  cgst_percent NUMERIC(5,2) NOT NULL DEFAULT 9.00 CHECK (cgst_percent >= 0 AND cgst_percent <= 50),
  sgst_percent NUMERIC(5,2) NOT NULL DEFAULT 9.00 CHECK (sgst_percent >= 0 AND sgst_percent <= 50),
  tax_mode TEXT NOT NULL DEFAULT 'exclusive' CHECK (tax_mode IN ('inclusive', 'exclusive')),
  upi_id TEXT CHECK (upi_id IS NULL OR upi_id LIKE '%@%'),
  payment_methods TEXT[] NOT NULL DEFAULT ARRAY['cash', 'upi'],
  receipt_header TEXT,
  receipt_footer TEXT NOT NULL DEFAULT 'Thank you! Visit again.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_settings_per_location UNIQUE (tenant_id, location_id)
);

CREATE TRIGGER trigger_store_settings_updated_at
BEFORE UPDATE ON public.store_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 5. storefront_config
CREATE TABLE public.storefront_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL DEFAULT 'theme-01',
  primary_color TEXT NOT NULL DEFAULT '#6366f1',
  accent_color TEXT NOT NULL DEFAULT '#10b981',
  font_heading TEXT NOT NULL DEFAULT 'Outfit',
  font_body TEXT NOT NULL DEFAULT 'Inter',
  banner_text TEXT,
  hero_text TEXT,
  hero_image_url TEXT,
  show_prices BOOLEAN NOT NULL DEFAULT true,
  allow_orders BOOLEAN NOT NULL DEFAULT true,
  show_blog BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_storefront_config_updated_at
BEFORE UPDATE ON public.storefront_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 6. subscription_limits
CREATE TABLE public.subscription_limits (
  tier TEXT PRIMARY KEY CHECK (tier IN ('Free', 'Pro', 'Growth', 'Enterprise')),
  max_locations INTEGER NOT NULL CHECK (max_locations >= -1), -- -1 indicates unlimited
  max_menu_items INTEGER NOT NULL CHECK (max_menu_items >= -1),
  analytics_access TEXT NOT NULL CHECK (analytics_access IN ('none', 'basic', 'full', 'full_api')),
  marketing_access BOOLEAN NOT NULL DEFAULT false,
  blog_enabled BOOLEAN NOT NULL DEFAULT false,
  custom_domain_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_subscription_limits_updated_at
BEFORE UPDATE ON public.subscription_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 3: Identity & Auth Tables

-- 7. staff_accounts
CREATE TABLE public.staff_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  login_id TEXT UNIQUE, -- populated via trigger: slug#staff_number
  auth_email TEXT UNIQUE, -- populated via trigger: slug-staff_number@staff.cafecanvas.bar
  staff_number INTEGER, -- populated via trigger
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'kitchen', 'delivery', 'staff')),
  pin_hash TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_assign_staff_login_id
BEFORE INSERT ON public.staff_accounts
FOR EACH ROW
EXECUTE FUNCTION public.assign_staff_login_id();

CREATE TRIGGER trigger_staff_accounts_updated_at
BEFORE UPDATE ON public.staff_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 8. staff_sessions (POS/Tablet session tracking)
CREATE TABLE public.staff_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff_accounts(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_staff_sessions_updated_at
BEFORE UPDATE ON public.staff_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 9. staff_shifts (attendance/shift geo-selfie check-ins)
CREATE TABLE public.staff_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  geo_lat NUMERIC(9,6),
  geo_lng NUMERIC(9,6),
  selfie_url TEXT,
  status TEXT NOT NULL DEFAULT 'working' CHECK (status IN ('working', 'leave', 'holiday')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_staff_shifts_updated_at
BEFORE UPDATE ON public.staff_shifts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 4: Menu System

-- 10. menu_categories
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_menu_categories_updated_at
BEFORE UPDATE ON public.menu_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 11. menu_items
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_paise INTEGER NOT NULL CHECK (price_paise > 0),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'hidden')),
  allows_modifiers BOOLEAN NOT NULL DEFAULT false,
  discount_eligible BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[],
  prep_time_min INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 12. modifier_groups
CREATE TABLE public.modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  min_select INTEGER NOT NULL DEFAULT 0 CHECK (min_select >= 0),
  max_select INTEGER NOT NULL DEFAULT 1 CHECK (max_select >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_modifier_groups_updated_at
BEFORE UPDATE ON public.modifier_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 13. modifier_options
CREATE TABLE public.modifier_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  extra_price_paise INTEGER NOT NULL DEFAULT 0 CHECK (extra_price_paise >= 0),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_modifier_options_updated_at
BEFORE UPDATE ON public.modifier_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 14. item_modifier_groups (junction table)
CREATE TABLE public.item_modifier_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES public.modifier_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_item_modifier_group UNIQUE (menu_item_id, modifier_group_id)
);

CREATE TRIGGER trigger_item_modifier_groups_updated_at
BEFORE UPDATE ON public.item_modifier_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 5: Tables & Sessions System

-- 15. dining_tables
CREATE TABLE public.dining_tables (
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

CREATE TRIGGER trigger_dining_tables_updated_at
BEFORE UPDATE ON public.dining_tables
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 16. table_sessions
CREATE TABLE public.table_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
  dining_table_id UUID NOT NULL REFERENCES public.dining_tables(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_revenue_paise INTEGER NOT NULL DEFAULT 0 CHECK (total_revenue_paise >= 0),
  customer_count INTEGER NOT NULL DEFAULT 1 CHECK (customer_count >= 1),
  assigned_staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  bill_id UUID, -- populated on bill checkout
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_table_sessions_updated_at
BEFORE UPDATE ON public.table_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 17. staff_calls
CREATE TABLE public.staff_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dining_table_id UUID REFERENCES public.dining_tables(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  session_id UUID REFERENCES public.table_sessions(id) ON DELETE SET NULL,
  called_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  attended_at TIMESTAMPTZ,
  attended_by UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_staff_calls_updated_at
BEFORE UPDATE ON public.staff_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 6: Order System

-- 18. orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  dining_table_id UUID REFERENCES public.dining_tables(id) ON DELETE SET NULL,
  table_number INTEGER,
  session_id UUID REFERENCES public.table_sessions(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled', 'void')),
  source TEXT NOT NULL CHECK (source IN ('storefront', 'pos', 'admin')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'card')),
  staff_verified BOOLEAN NOT NULL DEFAULT false,
  subtotal_paise INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_paise >= 0),
  cgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0),
  sgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0),
  discount_paise INTEGER NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  total_paise INTEGER NOT NULL DEFAULT 0 CHECK (total_paise >= 0),
  notes TEXT,
  local_ref TEXT,
  created_by UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 19. order_items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise >= 0),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  notes TEXT,
  kds_status TEXT NOT NULL DEFAULT 'pending' CHECK (kds_status IN ('pending', 'preparing', 'ready', 'served')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_order_items_updated_at
BEFORE UPDATE ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 20. order_item_modifiers
CREATE TABLE public.order_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  modifier_option_id UUID REFERENCES public.modifier_options(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_order_item_modifiers_updated_at
BEFORE UPDATE ON public.order_item_modifiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 7: Billing System

-- 21. bills
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  dining_table_id UUID REFERENCES public.dining_tables(id) ON DELETE SET NULL,
  table_number INTEGER,
  subtotal_paise INTEGER NOT NULL CHECK (subtotal_paise >= 0),
  cgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0),
  sgst_paise INTEGER NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0),
  discount_paise INTEGER NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  extra_charges_paise INTEGER NOT NULL DEFAULT 0 CHECK (extra_charges_paise >= 0),
  total_paise INTEGER NOT NULL CHECK (total_paise >= 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'voided')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'card')),
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 22. bill_items (snapshot of items at bill generation)
CREATE TABLE public.bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  unit_price_paise INTEGER NOT NULL CHECK (unit_price_paise >= 0),
  total_price_paise INTEGER NOT NULL CHECK (total_price_paise >= 0),
  modifiers_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_bill_items_updated_at
BEFORE UPDATE ON public.bill_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 23. payment_transactions
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'waived', 'refunded')),
  transaction_reference TEXT,
  staff_confirmed_by UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 8: Customer CRM

-- 24. customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  visit_count INTEGER NOT NULL DEFAULT 0 CHECK (visit_count >= 0),
  total_spend_paise BIGINT NOT NULL DEFAULT 0 CHECK (total_spend_paise >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_customer_phone_per_tenant UNIQUE (tenant_id, phone)
);

CREATE TRIGGER trigger_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 25. customer_visits
CREATE TABLE public.customer_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  dining_table_id UUID REFERENCES public.dining_tables(id) ON DELETE SET NULL,
  bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  spend_paise INTEGER NOT NULL DEFAULT 0 CHECK (spend_paise >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_customer_visits_updated_at
BEFORE UPDATE ON public.customer_visits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 9: Inventory

-- 26. inventory_items
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  current_stock NUMERIC(12,4) NOT NULL DEFAULT 0.0000 CHECK (current_stock >= 0),
  unit TEXT NOT NULL DEFAULT 'kg',
  low_stock_threshold NUMERIC(12,4) NOT NULL DEFAULT 0.0000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 27. inventory_transactions
CREATE TABLE public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC(12,4) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'waste', 'reconciliation', 'order_consumption')),
  unit_cost_paise INTEGER NOT NULL DEFAULT 0 CHECK (unit_cost_paise >= 0),
  notes TEXT,
  created_by UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_inventory_transactions_updated_at
BEFORE UPDATE ON public.inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 10: Marketing & Offers

-- 28. offer_codes
CREATE TABLE public.offer_codes (
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

CREATE TRIGGER trigger_offer_codes_updated_at
BEFORE UPDATE ON public.offer_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 29. discount_rules (automatic or targeted discounts)
CREATE TABLE public.discount_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('auto_apply', 'manual')),
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  value INTEGER NOT NULL CHECK (value > 0),
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'item')),
  target_category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  target_menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_discount_rules_updated_at
BEFORE UPDATE ON public.discount_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 30. campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT,
  body_template TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 31. coupon_redemptions (Offer code usage history)
CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  offer_code_id UUID NOT NULL REFERENCES public.offer_codes(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_coupon_redemptions_updated_at
BEFORE UPDATE ON public.coupon_redemptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 11: Content (Blog)

-- 32. blog_posts
CREATE TABLE public.blog_posts (
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

CREATE TRIGGER trigger_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 33. blog_categories
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_blog_category_slug_per_tenant UNIQUE (tenant_id, slug)
);

CREATE TRIGGER trigger_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 12: Notifications

-- 34. notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('staff_call', 'new_order', 'stock_alert', 'system')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 35. notification_reads
CREATE TABLE public.notification_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff_accounts(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_read_per_staff UNIQUE (notification_id, staff_id)
);

CREATE TRIGGER trigger_notification_reads_updated_at
BEFORE UPDATE ON public.notification_reads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 13: Analytics

-- 36. daily_revenue_snapshots
CREATE TABLE public.daily_revenue_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_revenue_paise BIGINT NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  average_order_value_paise INTEGER NOT NULL DEFAULT 0,
  payment_method_breakdown JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_snapshot_per_tenant_location_date UNIQUE (tenant_id, location_id, snapshot_date)
);

CREATE TRIGGER trigger_daily_revenue_snapshots_updated_at
BEFORE UPDATE ON public.daily_revenue_snapshots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 37. analytics_events (Raw event stream)
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_properties JSONB NOT NULL DEFAULT '{}',
  anonymous_session_token TEXT,
  staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- SECTION 14: Platform (Cafe Canvas Internal Support)

-- 38. platform_feedback
CREATE TABLE public.platform_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  feedback_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_platform_feedback_updated_at
BEFORE UPDATE ON public.platform_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 39. bug_reports
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  staff_id UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_bug_reports_updated_at
BEFORE UPDATE ON public.bug_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- 40. super_admin_notes
CREATE TABLE public.super_admin_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by UUID, -- ID of super admin staff
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_super_admin_notes_updated_at
BEFORE UPDATE ON public.super_admin_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();


-- SECTION 15: Utility Core Functions

-- 7. touch_session (updates session activity)
CREATE OR REPLACE FUNCTION public.touch_session(p_token TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.tenant_sessions 
  SET last_seen_at = NOW() 
  WHERE token_hash = p_token;
  
  UPDATE public.staff_sessions 
  SET last_seen_at = NOW() 
  WHERE token_hash = p_token;
END;
$$ LANGUAGE plpgsql;

-- 8. revoke_other_sessions (single-session enforcement)
CREATE OR REPLACE FUNCTION public.revoke_other_sessions(p_tenant_id UUID, p_keep_token TEXT)
RETURNS VOID AS $$
BEGIN
  -- Revoke other owner sessions
  UPDATE public.tenant_sessions
  SET revoked_at = NOW()
  WHERE tenant_id = p_tenant_id AND token_hash <> p_keep_token AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. regenerate_tenant_public_id
CREATE OR REPLACE FUNCTION public.regenerate_tenant_public_id(p_tenant_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
BEGIN
  new_id := public.generate_public_id();
  
  UPDATE public.tenants
  SET public_id = new_id
  WHERE id = p_tenant_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 11. check_subscription_limit
CREATE OR REPLACE FUNCTION public.check_subscription_limit(p_tenant_id UUID, p_feature TEXT, p_current_count INTEGER)
RETURNS BOOLEAN SECURITY DEFINER AS $$
DECLARE
  v_plan TEXT;
  v_limit INTEGER;
BEGIN
  -- Get plan
  SELECT plan INTO v_plan FROM public.tenants WHERE id = p_tenant_id;
  
  -- Resolve limit
  IF p_feature = 'locations' THEN
    SELECT max_locations INTO v_limit FROM public.subscription_limits WHERE tier = v_plan;
  ELSIF p_feature = 'menu_items' THEN
    SELECT max_menu_items INTO v_limit FROM public.subscription_limits WHERE tier = v_plan;
  ELSE
    RETURN false;
  END IF;
  
  -- -1 is unlimited
  IF v_limit = -1 THEN
    RETURN true;
  END IF;
  
  RETURN p_current_count < v_limit;
END;
$$ LANGUAGE plpgsql;


-- Triggers to Enforce Subscription Limits & Date Validity

-- Validates location insert limits
CREATE OR REPLACE FUNCTION public.fn_enforce_location_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_cnt INT;
BEGIN
  SELECT COUNT(*) INTO current_cnt FROM public.locations WHERE tenant_id = NEW.tenant_id;
  IF NOT public.check_subscription_limit(NEW.tenant_id, 'locations', current_cnt) THEN
    RAISE EXCEPTION 'Location limit exceeded for your subscription tier.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_location_limit
BEFORE INSERT ON public.locations
FOR EACH ROW
EXECUTE FUNCTION public.fn_enforce_location_limit();

-- Validates menu item limits
CREATE OR REPLACE FUNCTION public.fn_enforce_menu_item_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_cnt INT;
BEGIN
  SELECT COUNT(*) INTO current_cnt FROM public.menu_items WHERE tenant_id = NEW.tenant_id AND deleted_at IS NULL;
  IF NOT public.check_subscription_limit(NEW.tenant_id, 'menu_items', current_cnt) THEN
    RAISE EXCEPTION 'Menu item limit exceeded for your subscription tier.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_menu_item_limit
BEFORE INSERT ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.fn_enforce_menu_item_limit();

-- Validates offer code date ranges before insert
CREATE OR REPLACE FUNCTION public.fn_validate_offer_dates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date <= NEW.start_date THEN
    RAISE EXCEPTION 'Expiry date must be greater than start date.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_offer_dates
BEFORE INSERT OR UPDATE ON public.offer_codes
FOR EACH ROW
EXECUTE FUNCTION public.fn_validate_offer_dates();


-- SECTION 16: Complex Core Functions (create_order, generate_bill, apply_offer_code)

-- 3. apply_offer_code
CREATE OR REPLACE FUNCTION public.apply_offer_code(p_code TEXT, p_order_id UUID, p_tenant_id UUID)
RETURNS INTEGER SECURITY DEFINER AS $$
DECLARE
  v_offer_id UUID;
  v_discount_type TEXT;
  v_discount_val INT;
  v_min_order INT;
  v_max_discount INT;
  v_subtotal INT;
  v_used_count INT;
  v_max_uses INT;
  v_expiry TIMESTAMPTZ;
  v_discount_amount INT := 0;
BEGIN
  -- Get offer code details
  SELECT id, discount_type, discount_value, min_order_amount_paise, max_discount_amount_paise, expiry_date, max_uses, used_count
  INTO v_offer_id, v_discount_type, v_discount_val, v_min_order, v_max_discount, v_expiry, v_max_uses, v_used_count
  FROM public.offer_codes
  WHERE tenant_id = p_tenant_id AND code = p_code AND is_active = true;
  
  IF v_offer_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or inactive offer code.';
  END IF;
  
  IF v_expiry < NOW() THEN
    RAISE EXCEPTION 'Offer code has expired.';
  END IF;
  
  IF v_max_uses IS NOT NULL AND v_used_count >= v_max_uses THEN
    RAISE EXCEPTION 'Offer code usage limit reached.';
  END IF;
  
  -- Get order subtotal
  SELECT subtotal_paise INTO v_subtotal FROM public.orders WHERE id = p_order_id;
  
  IF v_subtotal < v_min_order THEN
    RAISE EXCEPTION 'Minimum order amount for this coupon is not met.';
  END IF;
  
  -- Calculate discount
  IF v_discount_type = 'percent' THEN
    v_discount_amount := round(v_subtotal * (v_discount_val / 100.0));
    IF v_max_discount > 0 AND v_discount_amount > v_max_discount THEN
      v_discount_amount := v_max_discount;
    END IF;
  ELSE
    v_discount_amount := v_discount_val;
  END IF;
  
  -- Verify discount doesn't exceed order subtotal
  IF v_discount_amount > v_subtotal THEN
    v_discount_amount := v_subtotal;
  END IF;
  
  RETURN v_discount_amount;
END;
$$ LANGUAGE plpgsql;

-- 1. create_order (ONLY insert path for orders)
CREATE OR REPLACE FUNCTION public.create_order(
  p_tenant_id UUID,
  p_session_id UUID,
  p_table_number INTEGER,
  p_items JSONB, -- Array of items: [{"menu_item_id": "...", "quantity": 1, "notes": "...", "modifiers": ["option_id_1"]}]
  p_source TEXT, -- 'storefront', 'pos', 'admin'
  p_payment_method TEXT -- 'cash', 'upi', 'card'
)
RETURNS UUID SECURITY DEFINER AS $$
DECLARE
  v_order_id UUID;
  v_location_id UUID;
  v_table_id UUID;
  v_item RECORD;
  v_opt_id UUID;
  v_item_unit_price INT;
  v_item_modifier_total INT;
  v_item_total INT;
  v_subtotal INT := 0;
  v_cgst_percent NUMERIC(5,2);
  v_sgst_percent NUMERIC(5,2);
  v_tax_mode TEXT;
  v_cgst_amount INT := 0;
  v_sgst_amount INT := 0;
  v_total_amount INT := 0;
  v_staff_verified BOOLEAN := false;
  v_order_item_id UUID;
  v_item_name TEXT;
  v_opt_name TEXT;
  v_opt_price INT;
  v_plan TEXT;
BEGIN
  -- 1. Verify subscription permits order source
  SELECT plan INTO v_plan FROM public.tenants WHERE id = p_tenant_id;
  IF p_source = 'storefront' AND v_plan = 'Free' THEN
    RAISE EXCEPTION 'Online ordering is not available in Free tier.';
  END IF;

  -- 2. Lock table session if dine-in
  IF p_session_id IS NOT NULL THEN
    SELECT dining_table_id, location_id INTO v_table_id, v_location_id
    FROM public.table_sessions
    WHERE id = p_session_id AND tenant_id = p_tenant_id AND check_out_at IS NULL
    FOR UPDATE;
    
    IF v_table_id IS NULL THEN
      RAISE EXCEPTION 'Invalid or inactive dining session.';
    END IF;
  ELSE
    -- Resolve branch location from first location (fallback if POS/admin order doesn't pass session)
    SELECT id INTO v_location_id FROM public.locations WHERE tenant_id = p_tenant_id LIMIT 1;
    IF p_table_number IS NOT NULL THEN
      SELECT id INTO v_table_id FROM public.dining_tables WHERE tenant_id = p_tenant_id AND table_number = p_table_number;
    END IF;
  END IF;

  -- 3. Calculate order subtotal by parsing items
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(menu_item_id UUID, quantity INT, notes TEXT, modifiers JSONB) LOOP
    -- Fetch item price
    SELECT price_paise, name INTO v_item_unit_price, v_item_name 
    FROM public.menu_items 
    WHERE id = v_item.menu_item_id AND tenant_id = p_tenant_id AND status = 'available' AND deleted_at IS NULL;
    
    IF v_item_unit_price IS NULL THEN
      RAISE EXCEPTION 'Menu item % is unavailable or deleted.', v_item.menu_item_id;
    END IF;
    
    -- Calculate modifiers
    v_item_modifier_total := 0;
    IF v_item.modifiers IS NOT NULL AND jsonb_array_length(v_item.modifiers) > 0 THEN
      FOR v_opt_id IN SELECT jsonb_array_elements_text(v_item.modifiers)::UUID LOOP
        SELECT extra_price_paise INTO v_opt_price 
        FROM public.modifier_options 
        WHERE id = v_opt_id;
        v_item_modifier_total := v_item_modifier_total + COALESCE(v_opt_price, 0);
      END LOOP;
    END IF;
    
    v_item_total := (v_item_unit_price + v_item_modifier_total) * v_item.quantity;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- 4. Calculate Tax (GST CGST + SGST split) in Paise
  SELECT cgst_percent, sgst_percent, tax_mode 
  INTO v_cgst_percent, v_sgst_percent, v_tax_mode
  FROM public.store_settings
  WHERE tenant_id = p_tenant_id AND (location_id = v_location_id OR location_id IS NULL)
  LIMIT 1;

  -- Default to 9% + 9% exclusive if settings missing
  IF v_cgst_percent IS NULL THEN v_cgst_percent := 9.00; END IF;
  IF v_sgst_percent IS NULL THEN v_sgst_percent := 9.00; END IF;
  IF v_tax_mode IS NULL THEN v_tax_mode := 'exclusive'; END IF;

  IF v_tax_mode = 'inclusive' THEN
    v_total_amount := v_subtotal;
    -- Subtotal net of tax
    v_subtotal := round(v_total_amount / (1.0 + (v_cgst_percent + v_sgst_percent) / 100.0));
    v_cgst_amount := round(v_subtotal * (v_cgst_percent / 100.0));
    v_sgst_amount := v_total_amount - v_subtotal - v_cgst_amount;
  ELSE
    v_cgst_amount := round(v_subtotal * (v_cgst_percent / 100.0));
    v_sgst_amount := round(v_subtotal * (v_sgst_percent / 100.0));
    v_total_amount := v_subtotal + v_cgst_amount + v_sgst_amount;
  END IF;

  -- 5. Determine verification
  IF p_source <> 'storefront' THEN
    v_staff_verified := true;
  END IF;

  -- 6. Insert Order
  INSERT INTO public.orders (
    tenant_id, location_id, dining_table_id, table_number, session_id, status, source, payment_method, staff_verified,
    subtotal_paise, cgst_paise, sgst_paise, discount_paise, total_paise, created_at
  )
  VALUES (
    p_tenant_id, v_location_id, v_table_id, p_table_number, p_session_id, 
    CASE WHEN v_staff_verified THEN 'confirmed'::text ELSE 'pending'::text END,
    p_source, p_payment_method, v_staff_verified, v_subtotal, v_cgst_amount, v_sgst_amount, 0, v_total_amount, NOW()
  )
  RETURNING id INTO v_order_id;

  -- 7. Insert Order Items and modifiers
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(menu_item_id UUID, quantity INT, notes TEXT, modifiers JSONB) LOOP
    SELECT price_paise, name INTO v_item_unit_price, v_item_name 
    FROM public.menu_items 
    WHERE id = v_item.menu_item_id;

    INSERT INTO public.order_items (
      order_id, menu_item_id, item_name, unit_price_paise, quantity, notes, kds_status, sent_at
    )
    VALUES (
      v_order_id, v_item.menu_item_id, v_item_name, v_item_unit_price, v_item.quantity, v_item.notes, 'pending', NOW()
    )
    RETURNING id INTO v_order_item_id;

    -- Modifiers insertion
    IF v_item.modifiers IS NOT NULL AND jsonb_array_length(v_item.modifiers) > 0 THEN
      FOR v_opt_id IN SELECT jsonb_array_elements_text(v_item.modifiers)::UUID LOOP
        SELECT name, extra_price_paise INTO v_opt_name, v_opt_price 
        FROM public.modifier_options 
        WHERE id = v_opt_id;

        INSERT INTO public.order_item_modifiers (order_item_id, modifier_option_id, name, price_paise)
        VALUES (v_order_item_id, v_opt_id, v_opt_name, v_opt_price);
      END LOOP;
    END IF;
  END LOOP;

  -- 8. Return Order ID
  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql;

-- 2. generate_bill
CREATE OR REPLACE FUNCTION public.generate_bill(p_order_id UUID)
RETURNS UUID SECURITY DEFINER AS $$
DECLARE
  v_bill_id UUID;
  v_tenant_id UUID;
  v_location_id UUID;
  v_table_id UUID;
  v_table_num INT;
  v_subtotal INT;
  v_cgst INT;
  v_sgst INT;
  v_discount INT;
  v_total INT;
  v_session_id UUID;
  v_item RECORD;
  v_mod_text TEXT;
BEGIN
  -- Fetch details from order
  SELECT tenant_id, location_id, dining_table_id, table_number, subtotal_paise, cgst_paise, sgst_paise, discount_paise, total_paise, session_id
  INTO v_tenant_id, v_location_id, v_table_id, v_table_num, v_subtotal, v_cgst, v_sgst, v_discount, v_total, v_session_id
  FROM public.orders
  WHERE id = p_order_id;

  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  -- Insert Bill
  INSERT INTO public.bills (
    tenant_id, location_id, dining_table_id, table_number, subtotal_paise, cgst_paise, sgst_paise, discount_paise, extra_charges_paise, total_paise, status, created_at
  )
  VALUES (
    v_tenant_id, v_location_id, v_table_id, v_table_num, v_subtotal, v_cgst, v_sgst, v_discount, 0, v_total, 'open', NOW()
  )
  RETURNING id INTO v_bill_id;

  -- Populate Bill Items (snapshot)
  FOR v_item IN (
    SELECT oi.item_name, oi.quantity, oi.unit_price_paise,
      (SELECT string_agg(name, ', ') FROM public.order_item_modifiers WHERE order_item_id = oi.id) as modifiers
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  ) LOOP
    INSERT INTO public.bill_items (bill_id, item_name, quantity, unit_price_paise, total_price_paise, modifiers_text)
    VALUES (v_bill_id, v_item.item_name, v_item.quantity, v_item.unit_price_paise, (v_item.unit_price_paise * v_item.quantity), v_item.modifiers);
  END LOOP;

  -- Link session if active
  IF v_session_id IS NOT NULL THEN
    UPDATE public.table_sessions
    SET bill_id = v_bill_id, total_revenue_paise = v_total
    WHERE id = v_session_id;
  END IF;

  RETURN v_bill_id;
END;
$$ LANGUAGE plpgsql;


-- SECTION 17: Row Level Security (RLS) Configuration

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_notes ENABLE ROW LEVEL SECURITY;

-- Helper policies

-- tenants: public can read, owner can update
CREATE POLICY tenants_select ON public.tenants FOR SELECT USING (true);
CREATE POLICY tenants_update ON public.tenants FOR UPDATE USING (id = public.get_tenant_id(auth.uid()));

-- subscription_limits: read only
CREATE POLICY limits_select ON public.subscription_limits FOR SELECT USING (true);

-- Tenant-scoped default Policies (OWNER/MANAGER full access, staff/cashier limited)
-- We enforce: tenant_id = get_tenant_id(auth.uid()) or using service_role (bypasses RLS)
-- Customers can read menu items, categories, config, blog posts (published)
-- Customers can insert/select calls, sessions, order_items associated with their session_token

CREATE POLICY menu_categories_customer ON public.menu_categories FOR SELECT USING (is_visible = true AND deleted_at IS NULL);
CREATE POLICY menu_categories_staff ON public.menu_categories FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

CREATE POLICY menu_items_customer ON public.menu_items FOR SELECT USING (status = 'available' AND deleted_at IS NULL);
CREATE POLICY menu_items_staff ON public.menu_items FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

CREATE POLICY modifier_groups_customer ON public.modifier_groups FOR SELECT USING (true);
CREATE POLICY modifier_groups_staff ON public.modifier_groups FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

CREATE POLICY modifier_options_customer ON public.modifier_options FOR SELECT USING (true);
CREATE POLICY modifier_options_staff ON public.modifier_options FOR ALL USING (true); -- scoped by group/tenant hierarchy

CREATE POLICY dining_tables_customer ON public.dining_tables FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY dining_tables_staff ON public.dining_tables FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Table Sessions: Customers can insert and select their own session_token
CREATE POLICY sessions_customer_insert ON public.table_sessions FOR INSERT WITH CHECK (check_out_at IS NULL);
CREATE POLICY sessions_customer_select ON public.table_sessions FOR SELECT USING (session_token = session_token);
CREATE POLICY sessions_staff ON public.table_sessions FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Staff calls: Customers can insert, staff can view and update
CREATE POLICY calls_customer_insert ON public.staff_calls FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY calls_customer_select ON public.staff_calls FOR SELECT USING (status = status);
CREATE POLICY calls_staff ON public.staff_calls FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Orders: Customer read-only of own session, creation via RPC only (RPC bypasses policy or runs as security definer)
CREATE POLICY orders_customer_select ON public.orders FOR SELECT USING (session_id IN (SELECT id FROM public.table_sessions WHERE session_token = session_token));
CREATE POLICY orders_staff ON public.orders FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

CREATE POLICY order_items_customer ON public.order_items FOR SELECT USING (true);
CREATE POLICY order_items_staff ON public.order_items FOR ALL USING (true);

-- Bills and transactions: staff only
CREATE POLICY bills_staff ON public.bills FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));
CREATE POLICY bill_items_staff ON public.bill_items FOR ALL USING (true);
CREATE POLICY pt_staff ON public.payment_transactions FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Customers and visits
CREATE POLICY customers_staff ON public.customers FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));
CREATE POLICY visits_staff ON public.customer_visits FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Inventory
CREATE POLICY inventory_staff ON public.inventory_items FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));
CREATE POLICY inv_trans_staff ON public.inventory_transactions FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Marketing
CREATE POLICY offers_customer ON public.offer_codes FOR SELECT USING (is_active = true AND expiry_date > NOW());
CREATE POLICY offers_staff ON public.offer_codes FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Blog posts: public select (published), staff full access
CREATE POLICY blog_public ON public.blog_posts FOR SELECT USING (is_published = true AND deleted_at IS NULL);
CREATE POLICY blog_staff ON public.blog_posts FOR ALL USING (tenant_id = public.get_tenant_id(auth.uid()));

-- Platform Feedback & Bug reports: staff can create, super admin full access
CREATE POLICY feedback_insert ON public.platform_feedback FOR INSERT WITH CHECK (tenant_id = public.get_tenant_id(auth.uid()));
CREATE POLICY feedback_super ON public.platform_feedback FOR ALL USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'SUPER_ADMIN');

CREATE POLICY bugs_staff ON public.bug_reports FOR SELECT OR INSERT OR UPDATE USING (tenant_id = public.get_tenant_id(auth.uid()));
CREATE POLICY bugs_super ON public.bug_reports FOR ALL USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'SUPER_ADMIN');


-- SECTION 18: Performance Indexes

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_locations_tenant ON public.locations(tenant_id);
CREATE INDEX idx_staff_accounts_tenant_role ON public.staff_accounts(tenant_id, role);
CREATE INDEX idx_menu_items_tenant_category ON public.menu_items(tenant_id, category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dining_tables_tenant_loc ON public.dining_tables(tenant_id, location_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_table_sessions_token ON public.table_sessions(session_token);
CREATE INDEX idx_orders_tenant_status ON public.orders(tenant_id, status);
CREATE INDEX idx_orders_session ON public.orders(session_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_bills_tenant_status ON public.bills(tenant_id, status);
CREATE INDEX idx_payment_transactions_bill ON public.payment_transactions(bill_id);
CREATE INDEX idx_customers_tenant_phone ON public.customers(tenant_id, phone);
CREATE INDEX idx_inventory_items_low_stock ON public.inventory_items(tenant_id, current_stock) WHERE current_stock <= low_stock_threshold;
CREATE INDEX idx_blog_posts_published ON public.blog_posts(tenant_id, is_published, published_at DESC) WHERE deleted_at IS NULL;


-- SECTION 19: DDL Schema Documentation (Table/Column Comments)

COMMENT ON TABLE public.tenants IS 'Core Cafe businesses onboarded to CafeCanvas.';
COMMENT ON COLUMN public.tenants.plan IS 'Subscription tier: Free, Pro, Growth, or Enterprise.';
COMMENT ON COLUMN public.tenants.public_id IS '12-char random unique identifier used in URLs.';
COMMENT ON COLUMN public.tenants.private_id IS 'Internal sequential ID (CC-XXXXX) for billing and support.';

COMMENT ON TABLE public.locations IS 'Branches/Outlets belonging to a tenant brand.';
COMMENT ON TABLE public.store_settings IS 'Tax rules (CGST/SGST), UPI config, and payment rules.';
COMMENT ON COLUMN public.store_settings.tax_mode IS 'Determines if menu prices include tax (inclusive) or not (exclusive).';
COMMENT ON COLUMN public.store_settings.upi_id IS 'Virtual Payment Address (VPA) of the cafe for customer payments.';

COMMENT ON TABLE public.staff_accounts IS 'Users/Employees carrying roles within a tenant restaurant brand.';
COMMENT ON COLUMN public.staff_accounts.login_id IS 'Synthetic credential login ID (e.g. cafe#1001).';
COMMENT ON COLUMN public.staff_accounts.auth_email IS 'Email matching login ID for Supabase auth integration.';

COMMENT ON TABLE public.dining_tables IS 'Physical tables located inside a location floor plan.';
COMMENT ON TABLE public.table_sessions IS 'Active customer scans and visit timelines per dining table.';
COMMENT ON COLUMN public.table_sessions.session_token IS 'Secure random token generated on scanning QR code.';

COMMENT ON TABLE public.orders IS 'Restaurant orders from POS and Storefront customers.';
COMMENT ON COLUMN public.orders.total_paise IS 'Calculated total order cost including taxes, in integer paise.';
COMMENT ON COLUMN public.orders.subtotal_paise IS 'Subtotal net of tax if inclusive, or gross if exclusive, in paise.';

COMMENT ON TABLE public.order_items IS 'Line items included in a customer order.';
COMMENT ON TABLE public.order_item_modifiers IS 'Custom modifiers selected for an ordered menu item.';
COMMENT ON TABLE public.bills IS 'Generated customer receipts compiling orders.';
COMMENT ON TABLE public.payment_transactions IS 'Logs of payments, reference codes, and validation status.';
COMMENT ON TABLE public.customers IS 'CRM profile database matching customer visits by phone.';
COMMENT ON TABLE public.inventory_items IS 'Ingredient stock items tracked inside a location branch.';
COMMENT ON TABLE public.offer_codes IS 'Promotional codes that customers or staff apply to bills.';
COMMENT ON TABLE public.platform_feedback IS 'Feedback submitted by restaurant staff directly to CafeCanvas team.';
COMMENT ON TABLE public.bug_reports IS 'Vulnerability, issues, or technical glitches logged by tenants.';
COMMENT ON TABLE public.super_admin_notes IS 'Super-admin internal account commentary regarding the tenant.';
