-- migration: 006_hero_images.sql
-- Add support for 3 hero background images

ALTER TABLE storefront_config 
ADD COLUMN IF NOT EXISTS hero_image_url_2 TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url_3 TEXT;
