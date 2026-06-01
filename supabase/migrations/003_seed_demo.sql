-- =========================================================================
-- CafeCanvas — Demo Seed Data
-- =========================================================================

-- 1. Insert Demo Tenant
INSERT INTO tenants (id, name, subdomain, plan, address, phone, gstin, active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'AETHER Café & Roastery',
  'demo',
  'pro',
  '42 Bandra West, Mumbai, India',
  '+91 98765 43210',
  '27AAAAA1111A1Z1',
  true
);

-- 2. Insert Branch
INSERT INTO branches (id, tenant_id, name, address, phone, active)
VALUES (
  'ab000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Main Bandra Roastery',
  '42 Bandra West, Mumbai, India',
  '+91 98765 43210',
  true
);

-- 3. Create Storefront Configuration
INSERT INTO storefront_config (tenant_id, theme_id, primary_color, accent_color, font_heading, font_body, banner_text, allow_orders)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'theme-01',
  '#6366f1',
  '#10b981',
  'Outfit',
  'Inter',
  '🎉 Happy Hour: Buy any specialty coffee and get a croissant 50% off! (4 PM to 7 PM)',
  true
);

-- 4. Create Store settings
INSERT INTO store_settings (tenant_id, branch_id, gstin, receipt_header, receipt_footer, cgst_percent, sgst_percent, service_charge_type, service_charge_value)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'ab000000-0000-0000-0000-000000000001',
  '27AAAAA1111A1Z1',
  'AETHER CAFE' || CHR(10) || 'Bandra West, Mumbai',
  'Thank you for dining with AETHER! See you again soon ☕',
  2.50,
  2.50,
  'percent',
  5.00
);

-- 5. Insert Floor Sections & Tables
INSERT INTO tables (id, tenant_id, branch_id, name, capacity, section, shape, status, position_x, position_y)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Table 1', 2, 'Indoor', 'square', 'available', 100, 150),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Table 2', 4, 'Indoor', 'square', 'available', 300, 150),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Table 3', 4, 'Indoor', 'round',  'available', 500, 150),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Table 4', 6, 'Indoor', 'long',   'available', 100, 350),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Table 5', 2, 'Indoor', 'square', 'available', 300, 350),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Patio 1', 4, 'Outdoor', 'round',  'available', 100, 100),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Patio 2', 2, 'Outdoor', 'round',  'available', 300, 100),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Bar Seat 1', 1, 'Bar', 'round', 'available', 100, 50),
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Bar Seat 2', 1, 'Bar', 'round', 'available', 200, 50),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Bar Seat 3', 1, 'Bar', 'round', 'available', 300, 50);

-- 6. Insert Menu Categories
INSERT INTO menu_categories (id, tenant_id, branch_id, name, icon, sort_order, is_visible)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Hot Specialty Coffee', '☕', 0, true),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Cold Brews & Blends', '🧊', 1, true),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Organic Tea Infusions', '🍵', 2, true),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Bakery & Fine Pastries', '🥐', 3, true),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Gourmet Mains & Bites', '🍽️', 4, true),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Botanical Coolers', '🍹', 5, true);

-- 7. Insert Menu Items (stored in paise, 1 rupee = 100 paise)
INSERT INTO menu_items (id, tenant_id, branch_id, category_id, name, description, price, available, featured, tags, prep_time_min, sort_order)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Classic Cappuccino', 'Double espresso with silky steamed milk and foam art.', 29000, 'available', true, ARRAY['bestseller', 'hot'], 5, 0),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Velvety Flat White', 'Rich ristretto shots finished with velvety steamed micro-foam.', 31000, 'available', false, ARRAY['hot'], 5, 1),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Caramel Macchiato', 'Silky steamed milk, espresso, organic vanilla, caramel drizzle.', 35000, 'available', false, ARRAY['hot', 'sweet'], 6, 2),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Signature Cold Brew', '24-hour slow-dripped single origin organic cold brew.', 35000, 'available', true, ARRAY['bestseller', 'cold'], 3, 0),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Iced Mocha Shake', 'Belgian dark chocolate blended with espresso over ice.', 38000, 'available', false, ARRAY['cold', 'sweet'], 4, 1),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Green Tea Mint Infusion', 'Loose-leaf organic green tea infused with organic mint leaves.', 21000, 'available', false, ARRAY['veg', 'healthy'], 4, 0),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Chamomile Honey Infusion', 'Premium soothing loose-leaf chamomile served with organic honey.', 23000, 'available', false, ARRAY['veg', 'healthy'], 4, 1),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Almond Butter Croissant', 'Buttery flaky pastry filled with roasted sweet almond cream.', 24000, 'available', true, ARRAY['bestseller', 'bakery'], 2, 0),
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Chocolate Truffle Pastry', 'Decadent dark chocolate ganache nested in buttery pastry.', 18000, 'available', false, ARRAY['sweet', 'bakery'], 2, 1),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Vegan Blueberry Muffin', 'Fluffy gluten-free muffin baked with fresh hillside blueberries.', 16000, 'unavailable', false, ARRAY['veg', 'healthy'], 2, 2),
  ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Avocado Sourdough Toast', 'Creamy avocado mash on sourdough, dressed with organic spices.', 39000, 'available', true, ARRAY['bestseller', 'veg'], 8, 0),
  ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Aether Loaded Burrito', 'Grilled chicken, organic black beans, fresh guac, homemade salsa.', 42000, 'available', false, ARRAY['spicy'], 12, 1),
  ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'Hibiscus Rose Cooler', 'Refreshing chilled hibiscus infusion with rose sweet syrups.', 23000, 'available', false, ARRAY['cold', 'healthy'], 3, 0),
  ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000006', 'Matcha Latte Special', 'Chilled ceremonial grade matcha, lightly sweetened with oat milk.', 32000, 'available', false, ARRAY['cold', 'healthy'], 4, 1);

-- 8. Insert Menu Modifiers Groups
INSERT INTO modifier_groups (id, item_id, name, required, min_select, max_select)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Milk Type', false, 0, 1),
  ('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Cup Size', true, 1, 1),
  ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000011', 'Add-ons', false, 0, 3);

-- 9. Insert Menu Modifiers Options (price in paise)
INSERT INTO modifier_options (group_id, name, extra_price, is_default)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Oat Milk', 3000, false),
  ('f0000000-0000-0000-0000-000000000001', 'Soy Milk', 2000, false),
  ('f0000000-0000-0000-0000-000000000001', 'Regular Milk', 0, true),
  ('f0000000-0000-0000-0000-000000000002', 'Regular', 0, true),
  ('f0000000-0000-0000-0000-000000000002', 'Large', 4000, false),
  ('f0000000-0000-0000-0000-000000000003', 'Extra Avocado Mash', 6000, false),
  ('f0000000-0000-0000-0000-000000000003', 'Organic Feta Cheese', 5000, false),
  ('f0000000-0000-0000-0000-000000000003', 'Perfect Poached Egg', 4000, false);
