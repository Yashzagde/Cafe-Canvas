-- Migration 019: Add Storefront Visibility Toggles to Storefront Config
ALTER TABLE storefront_config 
ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS show_instagram BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS show_story BOOLEAN DEFAULT true NOT NULL;
