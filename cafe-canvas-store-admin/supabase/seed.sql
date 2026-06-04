-- ============================================================
-- CAFE CANVAS STORE ADMIN — SEED SCRIPT
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ── 1. SEED: 1 TENANT ────────────────────────────────────────
INSERT INTO tenants (id, name, slug, email, phone, address, city, state, pincode, subscription_tier)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Aether Café',
  'aether-cafe',
  'owner@aether-cafe.com',
  '+91-9876543210',
  '12, MG Road, Koregaon Park',
  'Pune',
  'Maharashtra',
  '411001',
  'Pro'
) ON CONFLICT (slug) DO NOTHING;

-- ── 2. SEED: 1 LOCATION ──────────────────────────────────────
INSERT INTO locations (id, tenant_id, name, address, city, state, pincode)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Main Branch',
  '12, MG Road, Koregaon Park',
  'Pune', 'Maharashtra', '411001'
) ON CONFLICT DO NOTHING;

-- ── 3. SEED: STORE SETTINGS ──────────────────────────────────
INSERT INTO store_settings (tenant_id, currency, tax_cgst, tax_sgst)
VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'INR', 9.00, 9.00)
ON CONFLICT (tenant_id) DO NOTHING;

-- ── 4. SEED: 50 STAFF ACCOUNTS ─────────────────────────────
-- NOTE: These are DB records only. Auth users must be created via
-- Supabase Dashboard > Authentication > Users, or via Admin API.
-- The auth_user_id column will be linked post-auth-creation.

INSERT INTO staff_accounts (tenant_id, full_name, email, role, pin, location_id)
SELECT
  'aaaaaaaa-0000-0000-0000-000000000001',
  name,
  email,
  role,
  pin,
  'bbbbbbbb-0000-0000-0000-000000000001'
FROM (VALUES
  ('Arjun Sharma',     'arjun@aether-cafe.com',     'manager',  '1001'),
  ('Priya Mehta',      'priya@aether-cafe.com',      'manager',  '1002'),
  ('Rohan Verma',      'rohan@aether-cafe.com',      'cashier',  '1003'),
  ('Sneha Patil',      'sneha@aether-cafe.com',      'cashier',  '1004'),
  ('Amit Joshi',       'amit@aether-cafe.com',       'kitchen',  '1005'),
  ('Kavya Nair',       'kavya@aether-cafe.com',      'kitchen',  '1006'),
  ('Rahul Singh',      'rahul.s@aether-cafe.com',    'kitchen',  '1007'),
  ('Meera Iyer',       'meera@aether-cafe.com',      'delivery', '1008'),
  ('Vikas Rao',        'vikas@aether-cafe.com',      'delivery', '1009'),
  ('Pooja Desai',      'pooja@aether-cafe.com',      'cashier',  '1010'),
  ('Siddharth Kumar',  'sid@aether-cafe.com',        'staff',    '1011'),
  ('Ananya Goswami',   'ananya@aether-cafe.com',     'staff',    '1012'),
  ('Tushar Bhatt',     'tushar@aether-cafe.com',     'kitchen',  '1013'),
  ('Deepika Chauhan',  'deepika@aether-cafe.com',    'cashier',  '1014'),
  ('Nikhil Pandey',    'nikhil@aether-cafe.com',     'delivery', '1015'),
  ('Ishaan Malhotra',  'ishaan@aether-cafe.com',     'staff',    '1016'),
  ('Riya Kapoor',      'riya@aether-cafe.com',       'staff',    '1017'),
  ('Karan Agarwal',    'karan@aether-cafe.com',      'cashier',  '1018'),
  ('Simran Gill',      'simran@aether-cafe.com',     'kitchen',  '1019'),
  ('Akash Tiwari',     'akash@aether-cafe.com',      'delivery', '1020'),
  ('Nisha Bose',       'nisha@aether-cafe.com',      'staff',    '1021'),
  ('Devraj Saxena',    'devraj@aether-cafe.com',     'manager',  '1022'),
  ('Preet Kaur',       'preet@aether-cafe.com',      'staff',    '1023'),
  ('Mohit Gupta',      'mohit@aether-cafe.com',      'cashier',  '1024'),
  ('Aisha Khan',       'aisha@aether-cafe.com',      'kitchen',  '1025'),
  ('Shivam Mishra',    'shivam@aether-cafe.com',     'delivery', '1026'),
  ('Tanvi Shah',       'tanvi@aether-cafe.com',      'staff',    '1027'),
  ('Rajat Pillai',     'rajat@aether-cafe.com',      'cashier',  '1028'),
  ('Komal Choudhary',  'komal@aether-cafe.com',      'kitchen',  '1029'),
  ('Varun Bajaj',      'varun@aether-cafe.com',      'delivery', '1030'),
  ('Neha Srivastava',  'neha@aether-cafe.com',       'staff',    '1031'),
  ('Gaurav Lal',       'gaurav@aether-cafe.com',     'cashier',  '1032'),
  ('Preeti Mathur',    'preeti@aether-cafe.com',     'kitchen',  '1033'),
  ('Samir Ahuja',      'samir@aether-cafe.com',      'manager',  '1034'),
  ('Divya Rajan',      'divya@aether-cafe.com',      'staff',    '1035'),
  ('Abhinav Dubey',    'abhinav@aether-cafe.com',    'delivery', '1036'),
  ('Pallavi Trivedi',  'pallavi@aether-cafe.com',    'cashier',  '1037'),
  ('Manish Yadav',     'manish@aether-cafe.com',     'kitchen',  '1038'),
  ('Shruti Banerjee',  'shruti@aether-cafe.com',     'staff',    '1039'),
  ('Anil Shukla',      'anil@aether-cafe.com',       'delivery', '1040'),
  ('Ritika Chatterjee','ritika@aether-cafe.com',     'staff',    '1041'),
  ('Kunal Menon',      'kunal@aether-cafe.com',      'cashier',  '1042'),
  ('Jaya Sinha',       'jaya@aether-cafe.com',       'kitchen',  '1043'),
  ('Ravi Tripathi',    'ravi@aether-cafe.com',       'delivery', '1044'),
  ('Swati Naik',       'swati@aether-cafe.com',      'staff',    '1045'),
  ('Deepak Kulkarni',  'deepak@aether-cafe.com',     'cashier',  '1046'),
  ('Archana Hegde',    'archana@aether-cafe.com',    'kitchen',  '1047'),
  ('Yusuf Ansari',     'yusuf@aether-cafe.com',      'delivery', '1048'),
  ('Sunita Reddy',     'sunita@aether-cafe.com',     'staff',    '1049'),
  ('Harish Nambiar',   'harish@aether-cafe.com',     'manager',  '1050')
) AS t(name, email, role, pin)
ON CONFLICT (email) DO NOTHING;
