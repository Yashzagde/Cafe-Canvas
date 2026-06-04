-- ============================================================
-- CAFE CANVAS STORE ADMIN — DATA INFRASTRUCTURE SCHEMA
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. EXTENSION ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. TENANTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  logo_url        TEXT,
  subscription_tier TEXT DEFAULT 'Free'
                    CHECK (subscription_tier IN ('Free','Pro','Growth','Enterprise')),
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 3. LOCATIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  phone           TEXT,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 4. STAFF ACCOUNTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  role            TEXT DEFAULT 'staff'
                    CHECK (role IN ('manager','cashier','kitchen','delivery','staff')),
  pin             TEXT,                          -- 4-digit POS PIN
  location_id     UUID REFERENCES locations(id),
  is_active       BOOLEAN DEFAULT true,
  last_login      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 5. STORE SETTINGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  currency        TEXT DEFAULT 'INR',
  tax_cgst        NUMERIC(5,2) DEFAULT 9.00,
  tax_sgst        NUMERIC(5,2) DEFAULT 9.00,
  tax_inclusive   BOOLEAN DEFAULT false,
  razorpay_key_id TEXT,
  upi_id          TEXT,
  open_time       TIME DEFAULT '09:00',
  close_time      TIME DEFAULT '22:00',
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  delivery_radius  NUMERIC(6,2) DEFAULT 5.0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── 6. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings  ENABLE ROW LEVEL SECURITY;

-- Tenants: owner sees own row
CREATE POLICY "tenant_self" ON tenants
  FOR ALL USING (id = (SELECT tenant_id FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1)
                 OR email = auth.email());

-- Locations: tenant sees own locations
CREATE POLICY "tenant_locations" ON locations
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1));

-- Staff: tenant sees own staff
CREATE POLICY "tenant_staff" ON staff_accounts
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1));

-- Settings: tenant sees own settings
CREATE POLICY "tenant_settings" ON store_settings
  FOR ALL USING (tenant_id = (SELECT tenant_id FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1));
