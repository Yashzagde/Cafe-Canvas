-- migration: 007_logo_footer.sql
-- Add logo upload and footer information columns to storefront_config

ALTER TABLE storefront_config 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS footer_description TEXT,
ADD COLUMN IF NOT EXISTS footer_hours TEXT,
ADD COLUMN IF NOT EXISTS footer_address TEXT,
ADD COLUMN IF NOT EXISTS footer_phone TEXT,
ADD COLUMN IF NOT EXISTS footer_email TEXT;
