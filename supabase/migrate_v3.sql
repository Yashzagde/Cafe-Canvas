-- ============================================================
-- CAFE CANVAS SCHEMA — MIGRATION TO v3.0
-- Run in Supabase SQL Editor
-- SAFE: Uses IF NOT EXISTS, ADD COLUMN IF NOT EXISTS
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── UTILITY: updated_at trigger ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FIX C-1: tenants.public_id — UUID → 12-char alphanumeric
-- ============================================================

-- Step 1: Add new text column alongside old UUID column
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS public_id_new TEXT;

-- Step 2: Generate 12-char alphanumeric IDs for all tenants
CREATE OR REPLACE FUNCTION generate_public_id_text()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE r RECORD; new_id TEXT;
BEGIN
  FOR r IN SELECT id FROM tenants WHERE public_id_new IS NULL LOOP
    LOOP
      new_id := generate_public_id_text();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM tenants WHERE public_id_new = new_id);
    END LOOP;
    UPDATE tenants SET public_id_new = new_id WHERE id = r.id;
  END LOOP;
END $$;

-- Step 3: Drop old UUID column, rename new one
ALTER TABLE tenants DROP COLUMN IF EXISTS public_id CASCADE;
ALTER TABLE tenants RENAME COLUMN public_id_new TO public_id;
ALTER TABLE tenants ALTER COLUMN public_id SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT tenants_public_id_unique UNIQUE (public_id);

-- Trigger: auto-generate on INSERT
CREATE OR REPLACE FUNCTION auto_generate_public_id()
RETURNS TRIGGER AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  IF NEW.public_id IS NULL THEN
    LOOP
      result := '';
      FOR i IN 1..12 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM tenants WHERE public_id = result);
    END LOOP;
    NEW.public_id := result;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenants_public_id_trigger ON tenants;
CREATE TRIGGER tenants_public_id_trigger
  BEFORE INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION auto_generate_public_id();

-- ============================================================
-- FIX C-2: tenants.private_id — UUID → CC-XXXXX sequential
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS tenant_private_id_seq START WITH 1;

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS private_id_new TEXT;

DO $$
DECLARE r RECORD; seq_val INT;
BEGIN
  FOR r IN SELECT id FROM tenants WHERE private_id_new IS NULL ORDER BY created_at LOOP
    seq_val := nextval('tenant_private_id_seq');
    UPDATE tenants
    SET private_id_new = 'CC-' || LPAD(seq_val::TEXT, 5, '0')
    WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE tenants DROP COLUMN IF EXISTS private_id CASCADE;
ALTER TABLE tenants RENAME COLUMN private_id_new TO private_id;
ALTER TABLE tenants ALTER COLUMN private_id SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT tenants_private_id_unique UNIQUE (private_id);

-- Trigger: auto-assign CC-XXXXX on INSERT
CREATE OR REPLACE FUNCTION auto_assign_private_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.private_id IS NULL THEN
    NEW.private_id := 'CC-' || LPAD(nextval('tenant_private_id_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenants_private_id_trigger ON tenants;
CREATE TRIGGER tenants_private_id_trigger
  BEFORE INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION auto_assign_private_id();

-- ============================================================
-- FIX C-3: staff_accounts — add login_id system + fix role
-- ============================================================

ALTER TABLE staff_accounts
  ADD COLUMN IF NOT EXISTS login_id     TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS auth_email   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS staff_number TEXT,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT now();

-- Create sequence per tenant for staff numbers (stored as tenant-scoped counter)
-- Use a cross-tenant counter starting at 1001 scoped to login_id uniqueness
-- Populate login_id for existing staff from their email (best-effort migration)
DO $$
DECLARE
  r RECORD;
  t_slug TEXT;
  counter INT;
BEGIN
  FOR r IN
    SELECT sa.id, sa.email, sa.tenant_id
    FROM staff_accounts sa
    WHERE sa.login_id IS NULL
    ORDER BY sa.tenant_id, sa.created_at
  LOOP
    -- Get tenant slug
    SELECT slug INTO t_slug FROM tenants WHERE id = r.tenant_id;
    IF t_slug IS NULL THEN
      t_slug := 'tenant';
    END IF;

    -- Get next staff number for this tenant
    SELECT COALESCE(MAX(staff_number::INT), 1000) + 1
    INTO counter
    FROM staff_accounts
    WHERE tenant_id = r.tenant_id AND staff_number IS NOT NULL;

    UPDATE staff_accounts
    SET
      staff_number = counter::TEXT,
      login_id     = t_slug || '#' || counter::TEXT,
      auth_email   = t_slug || '-' || counter::TEXT || '@staff.cafecanvas.bar'
    WHERE id = r.id;
  END LOOP;
END $$;

-- Add role CHECK constraint (safe: drop and recreate)
ALTER TABLE staff_accounts DROP CONSTRAINT IF EXISTS staff_accounts_role_check;
ALTER TABLE staff_accounts
  ADD CONSTRAINT staff_accounts_role_check
  CHECK (role IN ('owner','manager','cashier','kitchen','delivery','staff'));

-- Drop redundant 'name' column
ALTER TABLE staff_accounts DROP COLUMN IF EXISTS name;

-- updated_at trigger
DROP TRIGGER IF EXISTS staff_accounts_updated_at ON staff_accounts;
CREATE TRIGGER staff_accounts_updated_at
  BEFORE UPDATE ON staff_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FIX C-4: orders — add missing columns
-- ============================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS source         TEXT DEFAULT 'pos'
    CHECK (source IN ('storefront', 'pos', 'admin')),
  ADD COLUMN IF NOT EXISTS session_id     UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS staff_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by    UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cgst_amount    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sgst_amount    INTEGER DEFAULT 0;

-- Fix status CHECK — remove 'completed' and 'billed', add 'void'
-- FIRST: Drop constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- SECOND: Migrate legacy status values (before adding new constraint check)
UPDATE orders SET status = 'served'    WHERE status = 'completed';
UPDATE orders SET status = 'served'    WHERE status = 'billed';

-- THIRD: Add constraint
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','preparing','ready','served','paid','cancelled','void'));

-- Backfill cgst_amount and sgst_amount from tax_amount (split equally)
UPDATE orders
SET cgst_amount = tax_amount / 2,
    sgst_amount = tax_amount - (tax_amount / 2)
WHERE cgst_amount = 0 AND tax_amount > 0;

-- Add COMMENT on monetary columns
COMMENT ON COLUMN orders.subtotal      IS 'Subtotal in paise (1 INR = 100 paise)';
COMMENT ON COLUMN orders.tax_amount    IS 'Total GST in paise (cgst_amount + sgst_amount). Kept for backward compat.';
COMMENT ON COLUMN orders.cgst_amount   IS 'CGST portion in paise';
COMMENT ON COLUMN orders.sgst_amount   IS 'SGST portion in paise';
COMMENT ON COLUMN orders.total         IS 'Final total in paise including GST and discounts';

-- ============================================================
-- FIX C-5: table_sessions — add session_token + fix structure
-- ============================================================

-- First drop the compatibility trigger and its function since check_in_at is being dropped
DROP TRIGGER IF EXISTS sync_table_sessions_compatibility_trig ON public.table_sessions;
DROP FUNCTION IF EXISTS public.sync_table_sessions_compatibility();

ALTER TABLE table_sessions
  ADD COLUMN IF NOT EXISTS session_token TEXT UNIQUE
    DEFAULT encode(gen_random_bytes(16), 'hex'),
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS table_number  TEXT;  -- what customer typed

-- Remove duplicate check_in_at (keep started_at)
ALTER TABLE table_sessions DROP COLUMN IF EXISTS check_in_at;

-- Remove denormalized order_ids array (orders FK to sessions instead via C-4)
ALTER TABLE table_sessions DROP COLUMN IF EXISTS order_ids;

-- Backfill table_number from FK table where possible
UPDATE table_sessions ts
SET table_number = t.table_number::TEXT
FROM tables t
WHERE ts.table_id = t.id AND ts.table_number IS NULL;

-- ============================================================
-- FIX C-6: store_settings — remove payment gateways, fix types
-- ============================================================

-- Remove Razorpay and all gateway columns
ALTER TABLE store_settings
  DROP COLUMN IF EXISTS razorpay_key_id,
  DROP COLUMN IF EXISTS active_gateway,
  DROP COLUMN IF EXISTS phonepe_merchant_id,
  DROP COLUMN IF EXISTS phonepe_terminal_id,
  DROP COLUMN IF EXISTS googlepay_merchant_id,
  DROP COLUMN IF EXISTS googlepay_terminal_id,
  DROP COLUMN IF EXISTS paytm_merchant_id,
  DROP COLUMN IF EXISTS paytm_terminal_id,
  DROP COLUMN IF EXISTS bharatpe_merchant_id,
  DROP COLUMN IF EXISTS bharatpe_terminal_id;

-- Add replacement UPI columns
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS payment_methods TEXT[]  DEFAULT ARRAY['cash','upi'],
  ADD COLUMN IF NOT EXISTS upi_name        TEXT,
  ADD COLUMN IF NOT EXISTS min_order_amount_paise INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT now();

-- Fix service_charge_value: NUMERIC → INTEGER (paise)
-- First add new column, copy data, drop old
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS service_charge_value_paise INTEGER DEFAULT 0;

UPDATE store_settings
SET service_charge_value_paise = (service_charge_value * 100)::INTEGER;

ALTER TABLE store_settings DROP COLUMN IF EXISTS service_charge_value;

COMMENT ON COLUMN store_settings.tax_cgst IS 'CGST rate in basis points. 250 = 2.5%. 900 = 9%.';
COMMENT ON COLUMN store_settings.tax_sgst IS 'SGST rate in basis points. 250 = 2.5%. 900 = 9%.';

-- updated_at trigger
DROP TRIGGER IF EXISTS store_settings_updated_at ON store_settings;
CREATE TRIGGER store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FIX C-7: Rename coupons → offer_codes (canonical name)
-- ============================================================

-- Strategy: Create new offer_codes table that merges discount + coupon logic
-- Then migrate existing data

CREATE TABLE IF NOT EXISTS offer_codes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code              TEXT NOT NULL,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('percentage', 'flat')),
  value             INTEGER NOT NULL,   -- basis points for %, paise for flat
  min_order_paise   INTEGER DEFAULT 0,
  max_discount_paise INTEGER,
  max_uses          INTEGER,
  current_uses      INTEGER DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  starts_at         TIMESTAMPTZ,
  ends_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);

-- Migrate existing coupons + discounts into offer_codes
INSERT INTO offer_codes (
  tenant_id, code, name, type, value,
  min_order_paise, max_discount_paise,
  max_uses, current_uses, is_active, ends_at, created_at
)
SELECT
  c.tenant_id,
  c.code,
  d.name,
  CASE WHEN d.type IN ('percentage','percent') THEN 'percentage' ELSE 'flat' END,
  d.value,
  d.min_order_amount,
  d.max_discount,
  c.max_uses,
  c.current_uses,
  c.is_active,
  c.expires_at,
  c.created_at
FROM coupons c
JOIN discounts d ON c.discount_id = d.id
ON CONFLICT DO NOTHING;

COMMENT ON TABLE offer_codes IS 'Canonical table for discount codes. Replaces coupons + discounts tables.';
COMMENT ON COLUMN offer_codes.value IS 'For percentage: value in basis points (1000 = 10%). For flat: value in paise.';

-- Drop old coupons and discounts
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS discounts CASCADE;

-- ============================================================
-- FIX C-8: customer_otp_sessions — security + tenant isolation
-- ============================================================

ALTER TABLE customer_otp_sessions
  ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS attempts  INTEGER DEFAULT 0;

-- Hash existing plaintext OTPs (one-way, existing sessions will be invalidated)
ALTER TABLE customer_otp_sessions
  ADD COLUMN IF NOT EXISTS otp_hash TEXT;

UPDATE customer_otp_sessions
SET otp_hash = encode(digest(otp, 'sha256'), 'hex')
WHERE otp_hash IS NULL AND otp IS NOT NULL;

-- Drop plaintext column (after backfill)
ALTER TABLE customer_otp_sessions DROP COLUMN IF EXISTS otp;

COMMENT ON COLUMN customer_otp_sessions.otp_hash IS 'SHA-256 hash of the 4-digit OTP. Never store plaintext.';
COMMENT ON COLUMN customer_otp_sessions.attempts  IS 'Failed attempt counter. Lock after 3 attempts.';

-- Update the customer OTP RPCs to use hashed OTPs, attempts, and tenant isolation
CREATE OR REPLACE FUNCTION public.request_customer_otp(
  p_phone TEXT,
  p_tenant_id UUID
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_otp TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Generate 6-digit OTP
  v_otp := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
  v_expires_at := now() + interval '5 minutes';

  -- Insert SHA-256 hashed OTP into customer_otp_sessions
  INSERT INTO public.customer_otp_sessions (phone, otp_hash, expires_at, verified, tenant_id, attempts)
  VALUES (p_phone, encode(digest(v_otp, 'sha256'), 'hex'), v_expires_at, false, p_tenant_id, 0);

  RETURN v_otp;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_customer_otp_and_checkin(
  p_phone TEXT,
  p_otp TEXT,
  p_tenant_id UUID,
  p_is_quick BOOLEAN
) RETURNS TABLE (
  success BOOLEAN,
  error_msg TEXT,
  visits INT,
  public_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
  v_customer_id UUID;
  v_visits INT;
  v_is_new BOOLEAN;
  v_public_id TEXT;
  v_otp_hash TEXT;
BEGIN
  -- 1. If not quick checkin, verify OTP
  IF NOT p_is_quick THEN
    v_otp_hash := encode(digest(p_otp, 'sha256'), 'hex');

    SELECT id INTO v_session_id
    FROM public.customer_otp_sessions
    WHERE phone = p_phone
      AND otp_hash = v_otp_hash
      AND verified = false
      AND expires_at > now()
      AND attempts < 3
      AND tenant_id = p_tenant_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_session_id IS NULL THEN
      -- Increment attempts for the active session
      UPDATE public.customer_otp_sessions
      SET attempts = attempts + 1
      WHERE id = (
        SELECT id FROM public.customer_otp_sessions
        WHERE phone = p_phone AND verified = false AND expires_at > now() AND tenant_id = p_tenant_id
        ORDER BY created_at DESC LIMIT 1
      );

      RETURN QUERY SELECT false, 'Invalid or expired OTP code'::TEXT, 0, NULL::TEXT;
      RETURN;
    END IF;

    -- Mark OTP as verified
    UPDATE public.customer_otp_sessions
    SET verified = true
    WHERE id = v_session_id;
  END IF;

  -- 2. Fetch or create customer
  SELECT id, total_visits INTO v_customer_id, v_visits
  FROM public.customers
  WHERE tenant_id = p_tenant_id
    AND phone = p_phone
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    v_visits := 1;
    v_is_new := true;
    INSERT INTO public.customers (tenant_id, phone, name, total_visits, total_spent, last_visit_at)
    VALUES (p_tenant_id, p_phone, 'Storefront Guest', 1, 0, now());
  ELSE
    v_visits := COALESCE(v_visits, 0) + 1;
    v_is_new := false;
    UPDATE public.customers
    SET total_visits = v_visits,
        last_visit_at = now()
    WHERE id = v_customer_id;
  END IF;

  -- 3. Log notification for Store Admin and Staff POS
  INSERT INTO public.notification_log (tenant_id, type, title, body, is_read)
  VALUES (
    p_tenant_id,
    'customer_checkin',
    CASE WHEN v_is_new THEN 'New Customer Registered' ELSE 'Customer Checked In' END,
    'Customer with phone number ' || p_phone || ' checked in on the digital menu (Visit #' || v_visits || ').',
    false
  );

  -- 4. Get tenant public_id
  SELECT COALESCE(public_id, '') INTO v_public_id
  FROM public.tenants
  WHERE id = p_tenant_id;

  RETURN QUERY SELECT true, NULL::TEXT, v_visits, v_public_id;
END;
$$;

-- Re-grant execute permissions to public function callers
GRANT EXECUTE ON FUNCTION public.request_customer_otp(TEXT, UUID) TO public;
GRANT EXECUTE ON FUNCTION public.verify_customer_otp_and_checkin(TEXT, TEXT, UUID, BOOLEAN) TO public;

-- ============================================================
-- FIX C-9: Rename modifier_groups_table → modifier_groups
-- ============================================================

-- First drop the view and triggers that link modifier_groups_table
DROP VIEW IF EXISTS public.modifier_groups CASCADE;
DROP TRIGGER IF EXISTS trg_sync_modifier_groups ON public.modifier_groups_table;
DROP FUNCTION IF EXISTS public.sync_modifier_groups_fields();

-- Drop view insert/update/delete handlers too
DROP FUNCTION IF EXISTS public.handle_modifier_groups_view_insert();
DROP FUNCTION IF EXISTS public.handle_modifier_groups_view_update();
DROP FUNCTION IF EXISTS public.handle_modifier_groups_view_delete();

-- Rename the table
ALTER TABLE modifier_groups_table RENAME TO modifier_groups;

-- Fix duplicate columns: keep min_selections / max_selections, drop min_select / max_select
ALTER TABLE modifier_groups
  DROP COLUMN IF EXISTS min_select,
  DROP COLUMN IF EXISTS max_select;

-- Add selection_type CHECK
ALTER TABLE modifier_groups DROP CONSTRAINT IF EXISTS modifier_groups_selection_type_check;
ALTER TABLE modifier_groups
  ADD CONSTRAINT modifier_groups_selection_type_check
  CHECK (selection_type IN ('single', 'multiple', 'optional') OR selection_type IS NULL);

-- ============================================================
-- FIX H-1: tables — remove branch_id duplicate
-- ============================================================

ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_branch_id_fkey;
ALTER TABLE tables DROP COLUMN IF EXISTS branch_id;

-- ============================================================
-- FIX H-2: tables — remove duplicate position columns
-- ============================================================

ALTER TABLE tables DROP COLUMN IF EXISTS floor_x;
ALTER TABLE tables DROP COLUMN IF EXISTS floor_y;

-- ============================================================
-- FIX H-3: modifier_options — consolidate to price_delta_paise
-- ============================================================

-- Drop old price syncing triggers
DROP TRIGGER IF EXISTS trg_sync_modifier_options ON public.modifier_options;
DROP FUNCTION IF EXISTS public.sync_modifier_options_fields();

-- Recreate trigger function to resolve tenant_id safely without using dropped columns
CREATE OR REPLACE FUNCTION public.sync_modifier_options_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-resolve tenant_id from modifier_groups if not supplied
  IF NEW.tenant_id IS NULL THEN
    SELECT tenant_id INTO NEW.tenant_id 
    FROM public.modifier_groups 
    WHERE id = NEW.group_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_modifier_options
BEFORE INSERT OR UPDATE ON public.modifier_options
FOR EACH ROW EXECUTE FUNCTION public.sync_modifier_options_fields();

-- Backfill price_delta_paise from price if null
UPDATE modifier_options
SET price_delta_paise = COALESCE(price_delta_paise, extra_price, price, 0);

ALTER TABLE modifier_options DROP COLUMN IF EXISTS price;
ALTER TABLE modifier_options DROP COLUMN IF EXISTS extra_price;

ALTER TABLE modifier_options
  ALTER COLUMN price_delta_paise SET DEFAULT 0,
  ALTER COLUMN price_delta_paise SET NOT NULL;

COMMENT ON COLUMN modifier_options.price_delta_paise IS 'Additional price for selecting this option, in paise. 0 = no extra charge.';

-- ============================================================
-- FIX H-5: bills — remove order_id, keep order_ids[], add bill_number
-- ============================================================

ALTER TABLE bills DROP CONSTRAINT IF EXISTS bills_order_id_fkey;
ALTER TABLE bills DROP COLUMN IF EXISTS order_id;
ALTER TABLE bills
  ADD COLUMN IF NOT EXISTS bill_number TEXT,
  ADD COLUMN IF NOT EXISTS session_id  UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT now();

-- Generate bill numbers for existing bills
DO $$
DECLARE r RECORD; num INT := 1;
BEGIN
  FOR r IN SELECT id, created_at FROM bills WHERE bill_number IS NULL ORDER BY created_at LOOP
    UPDATE bills
    SET bill_number = 'BILL-' ||
      TO_CHAR(r.created_at, 'YYYYMMDD') || '-' ||
      LPAD(num::TEXT, 4, '0')
    WHERE id = r.id;
    num := num + 1;
  END LOOP;
END $$;

-- ============================================================
-- FIX H-6: staff_calls — session link + constraint + rename
-- ============================================================

ALTER TABLE staff_calls
  ADD COLUMN IF NOT EXISTS session_id      UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS message         TEXT DEFAULT 'Customer requesting assistance',
  ADD COLUMN IF NOT EXISTS acknowledged_by UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at     TIMESTAMPTZ;

-- Migrate attended_by → acknowledged_by
UPDATE staff_calls
SET acknowledged_by = attended_by, acknowledged_at = attended_at
WHERE attended_by IS NOT NULL AND acknowledged_by IS NULL;

ALTER TABLE staff_calls DROP CONSTRAINT IF EXISTS staff_calls_attended_by_fkey;
ALTER TABLE staff_calls
  DROP COLUMN IF EXISTS attended_by,
  DROP COLUMN IF EXISTS attended_at;

-- Add status CHECK
ALTER TABLE staff_calls DROP CONSTRAINT IF EXISTS staff_calls_status_check;
ALTER TABLE staff_calls
  ADD CONSTRAINT staff_calls_status_check
  CHECK (status IN ('pending', 'acknowledged', 'resolved'));

-- ============================================================
-- FIX H-7: staff_attendance — remove duplicate column
-- ============================================================

UPDATE staff_attendance
SET duration_minutes = total_minutes
WHERE duration_minutes IS NULL AND total_minutes IS NOT NULL;

ALTER TABLE staff_attendance DROP COLUMN IF EXISTS total_minutes;
ALTER TABLE staff_attendance DROP COLUMN IF EXISTS shift_id; -- no shifts table exists yet

-- ============================================================
-- FIX H-8: audit_logs — add delivery to role CHECK
-- ============================================================

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_actor_role_check;
ALTER TABLE audit_logs
  ADD CONSTRAINT audit_logs_actor_role_check
  CHECK (actor_role IN ('owner','manager','cashier','kitchen','delivery','staff','system'));

-- ============================================================
-- FIX H-9: storefront_blogs → blog_posts + slug + published
-- ============================================================

ALTER TABLE storefront_blogs RENAME TO blog_posts;

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS slug         TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Generate slugs from titles for existing posts
UPDATE blog_posts
SET
  slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g')),
  is_published = (published_at <= now())
WHERE slug IS NULL;

-- Make published posts actually published
UPDATE blog_posts SET is_published = true WHERE published_at IS NOT NULL AND published_at <= now();

-- Add uniqueness constraint on slug per tenant
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_tenant_slug_unique UNIQUE (tenant_id, slug);

-- ============================================================
-- FIX H-10 to H-12: Add missing updated_at columns
-- ============================================================

-- tenants
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
DROP TRIGGER IF EXISTS tenants_updated_at ON tenants;
CREATE TRIGGER tenants_updated_at
  BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
DROP TRIGGER IF EXISTS locations_updated_at ON locations;
CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- menu_categories
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
DROP TRIGGER IF EXISTS menu_categories_updated_at ON menu_categories;
CREATE TRIGGER menu_categories_updated_at
  BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FIX H-15: menu_items — rename price columns
-- ============================================================

-- Add new columns with correct names
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS price_paise         INTEGER,
  ADD COLUMN IF NOT EXISTS compare_price_paise INTEGER;

-- Copy data
UPDATE menu_items SET price_paise = price WHERE price_paise IS NULL;
UPDATE menu_items SET compare_price_paise = compare_price WHERE compare_price_paise IS NULL;

-- Drop old columns
ALTER TABLE menu_items DROP COLUMN IF EXISTS price;
ALTER TABLE menu_items DROP COLUMN IF EXISTS compare_price;

-- Make price_paise NOT NULL
ALTER TABLE menu_items ALTER COLUMN price_paise SET NOT NULL;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_price_positive CHECK (price_paise > 0);

COMMENT ON COLUMN menu_items.price_paise         IS 'Item price in paise. ₹485 = 48500.';
COMMENT ON COLUMN menu_items.compare_price_paise IS 'Crossed-out original price in paise (for sale display).';

-- ============================================================
-- FIX M-9: storefront_config — hero carousel as JSONB
-- ============================================================

ALTER TABLE storefront_config ADD COLUMN IF NOT EXISTS hero_slides JSONB DEFAULT '[]';

-- Backfill data from columns
UPDATE storefront_config
SET hero_slides = (
  SELECT jsonb_strip_nulls(jsonb_build_array(
    CASE WHEN hero_image_url IS NOT NULL OR hero_title IS NOT NULL OR hero_subtitle IS NOT NULL THEN
      jsonb_build_object(
        'image_url', hero_image_url,
        'title', hero_title,
        'subtitle', hero_subtitle
      )
    ELSE NULL END,
    CASE WHEN hero_image_url_2 IS NOT NULL OR hero_title_2 IS NOT NULL OR hero_subtitle_2 IS NOT NULL THEN
      jsonb_build_object(
        'image_url', hero_image_url_2,
        'title', hero_title_2,
        'subtitle', hero_subtitle_2
      )
    ELSE NULL END,
    CASE WHEN hero_image_url_3 IS NOT NULL OR hero_title_3 IS NOT NULL OR hero_subtitle_3 IS NOT NULL THEN
      jsonb_build_object(
        'image_url', hero_image_url_3,
        'title', hero_title_3,
        'subtitle', hero_subtitle_3
      )
    ELSE NULL END
  ) - 'null')
);

ALTER TABLE storefront_config
  DROP COLUMN IF EXISTS hero_image_url,
  DROP COLUMN IF EXISTS hero_image_url_2,
  DROP COLUMN IF EXISTS hero_image_url_3,
  DROP COLUMN IF EXISTS hero_title,
  DROP COLUMN IF EXISTS hero_subtitle,
  DROP COLUMN IF EXISTS hero_title_2,
  DROP COLUMN IF EXISTS hero_subtitle_2,
  DROP COLUMN IF EXISTS hero_title_3,
  DROP COLUMN IF EXISTS hero_subtitle_3;

-- ============================================================
-- NEW TABLES
-- ============================================================

-- M-1: tenant_sessions (single-session enforcement)
CREATE TABLE IF NOT EXISTS tenant_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_token  TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  device_info    TEXT,
  ip_address     INET,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  last_seen_at   TIMESTAMPTZ DEFAULT now(),
  revoked_at     TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION revoke_other_tenant_sessions(p_tenant_id UUID, p_keep_token TEXT)
RETURNS void AS $$
BEGIN
  UPDATE tenant_sessions
  SET is_active = false, revoked_at = now()
  WHERE tenant_id = p_tenant_id
    AND session_token != p_keep_token
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- M-2 + M-3: Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id       UUID REFERENCES locations(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  unit              TEXT NOT NULL DEFAULT 'pieces'
                      CHECK (unit IN ('pieces','kg','g','l','ml','packets','boxes','other')),
  current_stock     NUMERIC(10,3) DEFAULT 0,
  reorder_level     NUMERIC(10,3) DEFAULT 0,
  cost_price_paise  INTEGER DEFAULT 0,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  inventory_item_id   UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type                TEXT NOT NULL CHECK (type IN ('in','out','adjustment','waste','transfer')),
  quantity            NUMERIC(10,3) NOT NULL,
  reference_type      TEXT,     -- 'order' | 'purchase' | 'manual'
  reference_id        UUID,
  notes               TEXT,
  created_by          UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- M-4: platform_feedback
CREATE TABLE IF NOT EXISTS platform_feedback (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID REFERENCES tenants(id) ON DELETE SET NULL,
  private_id       TEXT,   -- snapshot of CC-XXXXX at submission time
  tenant_name      TEXT,
  rating           SMALLINT CHECK (rating BETWEEN 1 AND 5),
  category         TEXT CHECK (category IN ('feature_request','general','pricing','other')),
  message          TEXT NOT NULL,
  app_context      TEXT,   -- which app submitted this
  status           TEXT DEFAULT 'new'
                     CHECK (status IN ('new','reviewed','actioned','closed')),
  super_note       TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- M-5: bug_reports
CREATE TABLE IF NOT EXISTS bug_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
  private_id      TEXT,
  tenant_name     TEXT,
  issue_type      TEXT CHECK (issue_type IN (
                    'login','screen_not_loading','data_not_saving',
                    'performance','incorrect_data','other'
                  )),
  description     TEXT NOT NULL,
  app_name        TEXT,
  app_version     TEXT,
  os_info         TEXT,
  screenshot_url  TEXT,
  status          TEXT DEFAULT 'open'
                    CHECK (status IN ('open','in_progress','resolved','wont_fix')),
  super_note      TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- M-6: payment_transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bill_id         UUID REFERENCES bills(id) ON DELETE SET NULL,
  order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount_paise    INTEGER NOT NULL,
  method          TEXT NOT NULL CHECK (method IN ('cash','upi','card','other')),
  status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending','completed','failed','refunded')),
  reference_id    TEXT,    -- UPI transaction ref, card auth code, etc.
  received_by     UUID REFERENCES staff_accounts(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- M-7: order_item_modifiers (normalized)
CREATE TABLE IF NOT EXISTS order_item_modifiers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_item_id        UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_group_id    UUID REFERENCES modifier_groups(id) ON DELETE SET NULL,
  modifier_option_id   UUID REFERENCES modifier_options(id) ON DELETE SET NULL,
  name_snapshot        TEXT NOT NULL,    -- name at time of order (denormalized)
  group_name_snapshot  TEXT,
  price_delta_paise    INTEGER DEFAULT 0,
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- M-10: notification_log improvements
ALTER TABLE notification_log
  ADD COLUMN IF NOT EXISTS staff_id     UUID REFERENCES staff_accounts(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS entity_type  TEXT,
  ADD COLUMN IF NOT EXISTS entity_id    UUID,
  ADD COLUMN IF NOT EXISTS is_read      BOOLEAN DEFAULT false;

-- Migrate old 'read' column → is_read if exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notification_log' AND column_name = 'read') THEN
    UPDATE notification_log SET is_read = read WHERE is_read = false;
    ALTER TABLE notification_log DROP COLUMN IF EXISTS read;
  END IF;
END $$;

-- ============================================================
-- L-2: Rename tables.qr_token → qr_code
-- ============================================================
ALTER TABLE tables RENAME COLUMN qr_token TO qr_code;

-- ============================================================
-- INDEXES — Performance
-- ============================================================

-- Core lookup indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug         ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_public_id    ON tenants(public_id);
CREATE INDEX IF NOT EXISTS idx_tenants_private_id   ON tenants(private_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email        ON tenants(email);

-- Staff lookup
CREATE INDEX IF NOT EXISTS idx_staff_tenant         ON staff_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_login_id       ON staff_accounts(login_id);
CREATE INDEX IF NOT EXISTS idx_staff_auth_email     ON staff_accounts(auth_email);
CREATE INDEX IF NOT EXISTS idx_staff_auth_user_id   ON staff_accounts(auth_user_id);

-- Orders hot path (real-time feed)
CREATE INDEX IF NOT EXISTS idx_orders_tenant        ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created       ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_session       ON orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_table         ON orders(table_id);

-- Table sessions
CREATE INDEX IF NOT EXISTS idx_table_sessions_token ON table_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_table_sessions_tenant ON table_sessions(tenant_id, is_active);

-- Staff calls (real-time)
CREATE INDEX IF NOT EXISTS idx_staff_calls_tenant   ON staff_calls(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_staff_calls_created  ON staff_calls(tenant_id, created_at DESC);

-- Menu
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant    ON menu_items(tenant_id, is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_category  ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_tenant ON menu_categories(tenant_id, is_visible);

-- Bills + payments
CREATE INDEX IF NOT EXISTS idx_bills_tenant_date    ON bills(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_status         ON bills(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_bill         ON payment_transactions(bill_id);
CREATE INDEX IF NOT EXISTS idx_payment_order        ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_tenant       ON payment_transactions(tenant_id);

-- Other new table indexes
CREATE INDEX IF NOT EXISTS idx_tenant_sessions_token ON tenant_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_tenant_sessions_tenant ON tenant_sessions(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_tx_item    ON inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_item ON order_item_modifiers(order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_tenant ON order_item_modifiers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tenant_slug ON blog_posts(tenant_id, slug);
CREATE INDEX IF NOT EXISTS idx_offer_codes_tenant_code ON offer_codes(tenant_id, code);

-- ============================================================
-- SECURITY — Row Level Security (RLS) policies
-- ============================================================

-- tenant_sessions
ALTER TABLE public.tenant_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_tenant_sessions" ON public.tenant_sessions;
CREATE POLICY "staff_read_tenant_sessions" ON public.tenant_sessions
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

-- inventory_items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_inventory_items" ON public.inventory_items;
CREATE POLICY "staff_read_inventory_items" ON public.inventory_items
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "manager_write_inventory_items" ON public.inventory_items;
CREATE POLICY "manager_write_inventory_items" ON public.inventory_items
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- inventory_transactions
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_inventory_transactions" ON public.inventory_transactions;
CREATE POLICY "staff_read_inventory_transactions" ON public.inventory_transactions
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_insert_inventory_transactions" ON public.inventory_transactions;
CREATE POLICY "staff_insert_inventory_transactions" ON public.inventory_transactions
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "manager_all_inventory_transactions" ON public.inventory_transactions;
CREATE POLICY "manager_all_inventory_transactions" ON public.inventory_transactions
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));

-- platform_feedback
ALTER TABLE public.platform_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_insert_platform_feedback" ON public.platform_feedback;
CREATE POLICY "staff_insert_platform_feedback" ON public.platform_feedback
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_read_platform_feedback" ON public.platform_feedback;
CREATE POLICY "staff_read_platform_feedback" ON public.platform_feedback
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

-- bug_reports
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_insert_bug_reports" ON public.bug_reports;
CREATE POLICY "staff_insert_bug_reports" ON public.bug_reports
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_read_bug_reports" ON public.bug_reports;
CREATE POLICY "staff_read_bug_reports" ON public.bug_reports
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

-- payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_payments" ON public.payment_transactions;
CREATE POLICY "staff_read_payments" ON public.payment_transactions
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "staff_insert_payments" ON public.payment_transactions;
CREATE POLICY "staff_insert_payments" ON public.payment_transactions
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "manager_all_payments" ON public.payment_transactions;
CREATE POLICY "manager_all_payments" ON public.payment_transactions
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager', 'cashier'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager', 'cashier'));

-- order_item_modifiers
ALTER TABLE public.order_item_modifiers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_order_modifiers" ON public.order_item_modifiers;
CREATE POLICY "staff_read_order_modifiers" ON public.order_item_modifiers
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "public_read_order_modifiers" ON public.order_item_modifiers;
CREATE POLICY "public_read_order_modifiers" ON public.order_item_modifiers
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "staff_insert_order_modifiers" ON public.order_item_modifiers;
CREATE POLICY "staff_insert_order_modifiers" ON public.order_item_modifiers
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "public_insert_order_modifiers" ON public.order_item_modifiers;
CREATE POLICY "public_insert_order_modifiers" ON public.order_item_modifiers
  FOR INSERT TO anon
  WITH CHECK (true);

-- offer_codes
ALTER TABLE public.offer_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_all_offer_codes" ON public.offer_codes;
CREATE POLICY "staff_all_offer_codes" ON public.offer_codes
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id())
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "public_read_offer_codes" ON public.offer_codes;
CREATE POLICY "public_read_offer_codes" ON public.offer_codes
  FOR SELECT TO anon
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

-- blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_all_blog_posts" ON public.blog_posts;
CREATE POLICY "staff_all_blog_posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id())
  WITH CHECK (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "public_read_blog_posts" ON public.blog_posts;
CREATE POLICY "public_read_blog_posts" ON public.blog_posts
  FOR SELECT TO anon
  USING (is_published = true);

-- Drop old storefront_blogs policies on blog_posts if any
DROP POLICY IF EXISTS "Allow public select by tenant_id" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow staff insert" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow staff update" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow staff delete" ON public.blog_posts;

-- Secure modifier_groups RLS policies
ALTER TABLE public.modifier_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_groups" ON public.modifier_groups;
CREATE POLICY "staff_read_groups" ON public.modifier_groups
  FOR SELECT TO authenticated
  USING (tenant_id = get_tenant_id());

DROP POLICY IF EXISTS "public_read_groups" ON public.modifier_groups;
CREATE POLICY "public_read_groups" ON public.modifier_groups
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "manager_write_groups" ON public.modifier_groups;
CREATE POLICY "manager_write_groups" ON public.modifier_groups
  FOR ALL TO authenticated
  USING (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'))
  WITH CHECK (tenant_id = get_tenant_id() AND get_user_role() IN ('owner', 'manager'));
