-- Migration 021: Add About/Story Fields to Storefront Config
ALTER TABLE public.storefront_config 
ADD COLUMN IF NOT EXISTS about_title TEXT,
ADD COLUMN IF NOT EXISTS about_text TEXT,
ADD COLUMN IF NOT EXISTS about_image_url TEXT;
