-- migration: 008_hero_slides_content.sql
-- Add support for customized titles and descriptions for all 3 hero slides

ALTER TABLE storefront_config 
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_title_2 TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_2 TEXT,
ADD COLUMN IF NOT EXISTS hero_title_3 TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_3 TEXT;
