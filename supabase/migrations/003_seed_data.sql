-- =========================================================================
-- CafeCanvas — Seed Data for Test Tenant "Chai Point"
-- =========================================================================

-- Clean up any existing test user in auth.users
DELETE FROM auth.users WHERE email = 'yashzagde01@gmail.com';


-- 2. Seed Tenant "Chai Point"
-- ID: c1000000-0000-0000-0000-000000000001
INSERT INTO public.tenants (
  id,
  name,
  slug,
  email,
  phone,
  subscription_tier,
  is_active
) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'Chai Point',
  'chai-point',
  'yashzagde01@gmail.com',
  '+919876543210',
  'Growth',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Seed Location "Main Branch"
-- ID: d1000000-0000-0000-0000-000000000001
INSERT INTO public.locations (
  id,
  tenant_id,
  name,
  address,
  city,
  state,
  pincode,
  phone,
  is_active
) VALUES (
  'd1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'Main Branch',
  '100 Feet Road, Indiranagar',
  'Bengaluru',
  'Karnataka',
  '560038',
  '+919876543211',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 4. Seed Staff Account for the Owner
-- ID: e1000000-0000-0000-0000-000000000001
INSERT INTO public.staff_accounts (
  id,
  tenant_id,
  location_id,
  auth_user_id,
  full_name,
  email,
  phone,
  role,
  pin,
  is_active
) VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000001',
  'd1000000-0000-0000-0000-000000000001',
  NULL,
  'Yash Zagde',
  'yashzagde01@gmail.com',
  '+919876543210',
  'manager',
  '1234',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 5. Seed Store Settings
INSERT INTO public.store_settings (
  tenant_id,
  currency,
  tax_cgst,
  tax_sgst,
  tax_inclusive,
  receipt_header,
  receipt_footer
) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'INR',
  250, -- 2.5%
  250, -- 2.5%
  FALSE,
  'CHAI POINT - INDIRANAGAR',
  'Thank you for drinking fresh Chai!'
) ON CONFLICT (tenant_id) DO NOTHING;

-- 6. Seed Storefront Config
INSERT INTO public.storefront_config (
  tenant_id,
  theme_id,
  primary_color,
  accent_color,
  show_prices,
  allow_orders
) VALUES (
  'c1000000-0000-0000-0000-000000000001',
  'theme-01',
  '#e67e22', -- Warm Tea Orange
  '#27ae60', -- Green Tea
  TRUE,
  TRUE
) ON CONFLICT (tenant_id) DO NOTHING;

-- 7. Seed Menu Categories
INSERT INTO public.menu_categories (id, tenant_id, name, name_hi, sort_order, is_visible) VALUES
('ca100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Hot Chai', 'गर्म चाय', 1, TRUE),
('ca100000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Snacks', 'नाश्ता', 2, TRUE),
('ca100000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Cold Beverages', 'ठंडे पेय', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Menu Items
INSERT INTO public.menu_items (id, tenant_id, category_id, name, name_hi, description, price, is_available, is_featured, dietary_tags, prep_time_mins, sort_order) VALUES
('ba100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000001', 'Masala Chai', 'मसाला चाय', 'Traditional Indian spiced tea brewed with fresh ginger and cardamom.', 8000, TRUE, TRUE, '{veg}', 5, 1),
('ba100000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000001', 'Ginger Chai', 'अदरक चाय', 'Brewed tea infused with crushed fresh ginger.', 7000, TRUE, FALSE, '{veg}', 5, 2),
('ba100000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000001', 'Elachi Chai', 'इलायची चाय', 'Brewed tea flavored with ground green cardamom.', 7500, TRUE, FALSE, '{veg}', 5, 3),
('ba100000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000002', 'Samosa (2 pcs)', 'समोसा (2 पीस)', 'Crispy pastry filled with spiced potatoes and peas.', 6000, TRUE, TRUE, '{veg}', 8, 1),
('ba100000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000002', 'Bun Maska', 'बन मस्का', 'Soft bun sliced and loaded with fresh butter.', 5000, TRUE, FALSE, '{veg}', 3, 2),
('ba100000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000002', 'Paneer Tikka Sandwich', 'पनीर टिक्का सैंडविच', 'Grilled sandwich stuffed with spiced paneer tikka.', 12000, TRUE, TRUE, '{veg}', 10, 3),
('ba100000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000003', 'Mango Lassi', 'मैंगो लस्सी', 'Creamy, sweet yogurt drink flavored with mango pulp.', 9000, TRUE, TRUE, '{veg}', 4, 1),
('ba100000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000003', 'Cold Coffee', 'कोल्ड कॉफ़ी', 'Chilled blended milk, ice cream, and espresso.', 11000, TRUE, FALSE, '{veg}', 4, 2)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Tables
INSERT INTO public.tables (id, tenant_id, location_id, name, table_number, capacity, section, qr_token, status, is_active) VALUES
('f1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Table 1', 1, 2, 'Indoor', 'CP-T1-token', 'vacant', TRUE),
('f1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Table 2', 2, 4, 'Indoor', 'CP-T2-token', 'vacant', TRUE),
('f1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Table 3', 3, 4, 'Rooftop', 'CP-T3-token', 'vacant', TRUE),
('f1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Table 4', 4, 6, 'Rooftop', 'CP-T4-token', 'vacant', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Customers
INSERT INTO public.customers (id, tenant_id, name, phone, email, total_visits, total_spent) VALUES
('ae100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Aarav Sharma', '+919988776655', 'aarav@example.com', 5, 45000),
('ae100000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Aditi Rao', '+918877665544', 'aditi@example.com', 2, 18000)
ON CONFLICT (id) DO NOTHING;

-- 11. Seed Active Table Session (for Demo POS)
INSERT INTO public.table_sessions (id, tenant_id, table_id, customer_name, customer_phone, pax, started_at) VALUES
('fa100000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'Aarav Sharma', '+919988776655', 2, NOW() - INTERVAL '15 minutes')
ON CONFLICT (id) DO NOTHING;
