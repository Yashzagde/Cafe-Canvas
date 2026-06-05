-- =========================================================================
-- CafeCanvas — Seed Data v3.0
-- =========================================================================

-- 1. Seed Subscription Limits (Reference Table)
INSERT INTO public.subscription_limits (tier, max_locations, max_menu_items, analytics_access, marketing_access, blog_enabled, custom_domain_enabled)
VALUES
  ('Free', 1, 50, 'none', false, false, false),
  ('Pro', 3, 500, 'basic', false, true, false),
  ('Growth', 10, -1, 'full', true, true, false),
  ('Enterprise', -1, -1, 'full_api', true, true, true)
ON CONFLICT (tier) DO NOTHING;

-- 2. Seed Tenant (Aether Café)
INSERT INTO public.tenants (id, name, slug, email, plan, logo_url, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Aether Café & Roastery',
  'aether-cafe',
  'contact@aethercafe.com',
  'Pro',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=150&q=80',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Location (Main Branch, Pune)
INSERT INTO public.locations (id, tenant_id, name, address, phone, is_active)
VALUES (
  'ab000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Main Branch, Pune',
  'Ghole Road, Shivaji Nagar, Pune, Maharashtra 411005',
  '+91 20 2553 4900',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Store Settings (CGST 9%, SGST 9%, UPI, cash/upi payment methods)
INSERT INTO public.store_settings (tenant_id, location_id, cgst_percent, sgst_percent, tax_mode, upi_id, payment_methods, receipt_header, receipt_footer)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'ab000000-0000-0000-0000-000000000001',
  9.00,
  9.00,
  'exclusive',
  'aethercafe@okaxis',
  ARRAY['cash', 'upi'],
  'Aether Café & Roastery' || CHR(10) || 'Shivaji Nagar, Pune',
  'Thank you for dining with us! Visit again. ☕'
)
ON CONFLICT (tenant_id, location_id) DO NOTHING;

-- 5. Seed Storefront Config
INSERT INTO public.storefront_config (tenant_id, theme_id, primary_color, accent_color, font_heading, font_body, banner_text, hero_text, hero_image_url, show_prices, allow_orders, show_blog)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'theme-01',
  '#6366f1',
  '#10b981',
  'Outfit',
  'Inter',
  'Get 10% off on your first dine-in scan! Use code WELCOME100',
  'Welcome to Aether Café & Roastery',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  true,
  true,
  true
)
ON CONFLICT (tenant_id) DO NOTHING;

-- 6. Seed 50 Staff Accounts (Automatic triggers will assign login_id and auth_email)
-- Roles: owner, manager, cashier, kitchen, delivery, staff
INSERT INTO public.staff_accounts (tenant_id, location_id, name, role, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'owner', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Priya Patel', 'manager', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Amit Gupta', 'manager', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Rohan Mehta', 'cashier', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Sunita Rao', 'cashier', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Rahul Singh', 'cashier', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Vivek Joshi', 'kitchen', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Deepa Nair', 'kitchen', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Rajesh Kumar', 'kitchen', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Sneha Patil', 'kitchen', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Pooja Mishra', 'delivery', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Anil Verma', 'delivery', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Neha Sharma', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Manoj Tiwari', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Vikram Malhotra', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Kiran Deshmukh', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Arjun Reddy', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Divya Choudhary', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Sanjay Dutt', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Shalini Sen', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Harish Iyer', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Meera Nair', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Gaganpreet Singh', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Yash Zagde', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Riya Sen', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Devendra Fadnavis', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Nitin Gadkari', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Sachin Tendulkar', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'MS Dhoni', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Virat Kohli', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Rohit Sharma', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Jasprit Bumrah', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Hardik Pandya', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'KL Rahul', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Shreyas Iyer', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Rishabh Pant', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Ravindra Jadeja', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Ravichandran Ashwin', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Bhuvneshwar Kumar', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Mohammed Shami', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Yuzvendra Chahal', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Kuldeep Yadav', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Axar Patel', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Shubman Gill', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Ishan Kishan', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Suryakumar Yadav', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Sanju Samson', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Deepak Chahar', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Shardul Thakur', 'staff', true),
  ('a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Mohammed Siraj', 'staff', true);

-- 7. Seed 5 Menu Categories
INSERT INTO public.menu_categories (id, tenant_id, location_id, name, icon, sort_order, is_visible)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Specialty Coffee', '☕', 1, true),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Teas & Infusions', '🍵', 2, true),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Bakery & Pastries', '🥐', 3, true),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Gourmet Mains', '🍽️', 4, true),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Coolers & Mocktails', '🍹', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed 20 Menu Items (Prices in paise: ₹100 = 10000 paise)
INSERT INTO public.menu_items (id, tenant_id, location_id, category_id, name, description, price_paise, status, featured, tags, prep_time_min, sort_order)
VALUES
  -- Coffee (1-4)
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Classic Cappuccino', 'Double espresso with silky steamed milk and foam art.', 24000, 'available', true, ARRAY['hot', 'coffee'], 5, 1),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Espresso Shot', 'Rich, concentrated single origin coffee extract.', 12000, 'available', false, ARRAY['hot', 'strong'], 3, 2),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Velvety Flat White', 'Rich ristretto shots finished with velvety steamed micro-foam.', 26000, 'available', false, ARRAY['hot'], 5, 3),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Vietnamese Iced Coffee', 'Bold drip coffee sweetened with condensed milk over ice.', 28000, 'available', true, ARRAY['cold', 'sweet'], 6, 4),
  
  -- Teas (5-8)
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Masala Chai', 'Traditional Indian spiced tea brewed with fresh milk.', 14000, 'available', true, ARRAY['hot', 'spiced'], 7, 1),
  ('e0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Organic Green Tea', 'Steeped loose leaf green tea rich in antioxidants.', 18000, 'available', false, ARRAY['hot', 'healthy'], 5, 2),
  ('e0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Earl Grey Tea', 'Black tea infused with oil of bergamot.', 19000, 'available', false, ARRAY['hot'], 5, 3),
  ('e0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Chamomile Infusion', 'Soothe your soul with organic caffeine-free chamomile.', 21000, 'available', false, ARRAY['hot', 'calming'], 5, 4),
  
  -- Bakery (9-12)
  ('e0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Butter Croissant', 'Flaky, buttery pastry layers rolled to perfection.', 15000, 'available', true, ARRAY['bakery', 'veg'], 2, 1),
  ('e0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Almond Croissant', 'Flaky pastry filled with roasted almond sweet cream.', 22000, 'available', false, ARRAY['bakery', 'nuts'], 2, 2),
  ('e0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Pain Au Chocolat', 'Laminated pastry wrapping dark Belgian chocolate sticks.', 18000, 'available', true, ARRAY['bakery', 'sweet'], 2, 3),
  ('e0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 'Blueberry Cheesecake', 'Creamy baked NY cheesecake topped with sweet blueberries.', 29000, 'available', true, ARRAY['dessert', 'sweet'], 3, 4),
  
  -- Mains (13-16)
  ('e0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Avocado Toast', 'Crushed fresh avocado on sourdough with pumpkin seeds.', 34000, 'available', true, ARRAY['veg', 'healthy'], 8, 1),
  ('e0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Pesto Chicken Panini', 'Grilled chicken, house pesto, mozzarella in toasted panini.', 38000, 'available', false, ARRAY['spicy'], 10, 2),
  ('e0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Truffle Mushroom Fries', 'Crispy fries tossed in white truffle oil and parmesan.', 28000, 'available', false, ARRAY['veg'], 6, 3),
  ('e0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'Spicy Arrabiata Pasta', 'Penne in spicy garlic tomato sauce with olives and basil.', 32000, 'available', false, ARRAY['veg', 'spicy'], 12, 4),
  
  -- Coolers (17-20)
  ('e0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Mint Mojito', 'Fresh mint, lime wedges, organic sugar, and sparkling soda.', 19000, 'available', true, ARRAY['cold', 'sweet'], 4, 1),
  ('e0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Hibiscus Rose Fizz', 'Chilled rose flower tea fizzed with soda and sweeteners.', 21000, 'available', false, ARRAY['cold', 'floral'], 4, 2),
  ('e0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Peach Iced Tea', 'Brewed black tea infused with real peach extract and ice.', 20000, 'available', true, ARRAY['cold'], 3, 3),
  ('e0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 'Mango Passion Cooler', 'Creamy Alphonso mango pulp shaken with passion fruit syrup.', 24000, 'available', false, ARRAY['cold', 'sweet'], 4, 4)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed 3 Modifier Groups
INSERT INTO public.modifier_groups (id, tenant_id, name, required, min_select, max_select)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Milk Selection', false, 0, 1),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Espresso Strength', true, 1, 1),
  ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Mains Customization', false, 0, 3)
ON CONFLICT (id) DO NOTHING;

-- Seed Options for Milk Selection (Group 1)
INSERT INTO public.modifier_options (id, group_id, name, extra_price_paise, is_default)
VALUES
  ('fa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Regular Dairy Milk', 0, true),
  ('fa000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'Oat Milk', 3000, false),
  ('fa000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'Soy Milk', 2000, false)
ON CONFLICT (id) DO NOTHING;

-- Seed Options for Espresso Strength (Group 2)
INSERT INTO public.modifier_options (id, group_id, name, extra_price_paise, is_default)
VALUES
  ('fa000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'Single Shot', 0, true),
  ('fa000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', 'Double Shot (Extra Bold)', 4000, false)
ON CONFLICT (id) DO NOTHING;

-- Seed Options for Mains Customization (Group 3)
INSERT INTO public.modifier_options (id, group_id, name, extra_price_paise, is_default)
VALUES
  ('fa000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003', 'Extra Avocado Mash', 6000, false),
  ('fa000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000003', 'Feta Cheese Crumbles', 5000, false),
  ('fa000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000003', 'Perfect Poached Egg', 4000, false)
ON CONFLICT (id) DO NOTHING;

-- Link Modifier Groups to Menu Items via Junctions
INSERT INTO public.item_modifier_groups (tenant_id, menu_item_id, modifier_group_id)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000003')
ON CONFLICT (menu_item_id, modifier_group_id) DO NOTHING;

-- 10. Seed 2 Dining Tables
INSERT INTO public.dining_tables (id, tenant_id, location_id, name, table_number, capacity, section, shape, status, position_x, position_y)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Table 1', 1, 2, 'Indoor', 'square', 'available', 100, 150),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'ab000000-0000-0000-0000-000000000001', 'Table 2', 2, 4, 'Indoor', 'square', 'available', 300, 150)
ON CONFLICT (id) DO NOTHING;

-- 11. Seed 1 Offer Code (WELCOME100 - Flat 100 Rs = 10000 paise discount, min spend 50000 paise)
INSERT INTO public.offer_codes (id, tenant_id, code, description, discount_type, discount_value, min_order_amount_paise, max_discount_amount_paise, start_date, expiry_date, max_uses, used_count, per_customer_limit, is_active)
VALUES (
  '10000000-0000-0000-0000-000000000100',
  'a0000000-0000-0000-0000-000000000001',
  'WELCOME100',
  'Flat Rs.100 off on order above Rs.500',
  'flat',
  10000,
  50000,
  10000,
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '30 days',
  5000,
  0,
  1,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 12. Seed 1 Published Blog Post
INSERT INTO public.blog_posts (id, tenant_id, title, slug, content, hero_image_url, is_published, published_at)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'The Art of Single-Origin Cold Brews',
  'art-of-single-origin-cold-brew',
  'Here at Aether, we slow-drip our single-origin coffees for exactly 24 hours. This extracts deep notes of cocoa, blueberry, and nuts without any bitterness. Read more to see our roasting profiles and bean processing methods...',
  'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80',
  true,
  NOW()
)
ON CONFLICT (id) DO NOTHING;
