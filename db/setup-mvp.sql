-- Cafe Canva MVP Database Setup Script
-- Run this in your Supabase SQL Editor

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'staff', 'kos');
CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'ready', 'completed', 'cancelled');

-- Create Tables

-- 1. stores
CREATE TABLE public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL, -- Will foreign key to auth.users later if needed or public.users
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. users (Extended profile for auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'staff'::user_role NOT NULL,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. menu_items
CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    category TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    customer_name TEXT,
    table_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. order_items
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (For MVP we can make them permissive for authenticated users for simplicity,
-- or more strict if needed. Let's start with basic access)

-- stores
CREATE POLICY "Public stores are viewable by everyone." ON public.stores FOR SELECT USING (true);
CREATE POLICY "Admins can insert stores." ON public.stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update stores." ON public.stores FOR UPDATE USING (true);

-- users
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert profile." ON public.users FOR INSERT WITH CHECK (true);

-- menu_items
CREATE POLICY "Menu items are viewable by everyone." ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins and staff can insert menu items." ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins and staff can update menu items." ON public.menu_items FOR UPDATE USING (true);
CREATE POLICY "Admins and staff can delete menu items." ON public.menu_items FOR DELETE USING (true);

-- orders
CREATE POLICY "Orders viewable by everyone." ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders." ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can update orders." ON public.orders FOR UPDATE USING (true);

-- order_items
CREATE POLICY "Order items viewable by everyone." ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order items." ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff can update order items." ON public.order_items FOR UPDATE USING (true);

-- Realtime Setup for orders and order_items (crucial for KOS)
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
