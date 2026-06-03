-- Migration 027: Seed Super Admin Credentials
-- Email: yashzagde01@gmail.com
-- Password: yashz562
-- Role: platform_owner

BEGIN;

-- 1. Insert into auth.users (Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000099',
  'authenticated',
  'authenticated',
  'yashzagde01@gmail.com',
  crypt('yashz562', gen_salt('bf', 10)),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Yash Zagde"}',
  FALSE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert into public.users (User Profile)
INSERT INTO public.users (
  id,
  tenant_id,
  branch_id,
  name,
  email,
  role,
  active
) VALUES (
  'a0000000-0000-0000-0000-000000000099',
  NULL,
  NULL,
  'Yash Zagde',
  'yashzagde01@gmail.com',
  'owner',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert into public.super_admin_users (Platform Role)
INSERT INTO public.super_admin_users (
  id,
  role,
  created_at
) VALUES (
  'a0000000-0000-0000-0000-000000000099',
  'platform_owner',
  NOW()
) ON CONFLICT (id) DO NOTHING;

COMMIT;
