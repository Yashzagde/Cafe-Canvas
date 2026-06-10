-- migration: 004_add_public_id.sql
-- Add public_id column to tenants table to support storefront resolving and client-side POS linking

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid() UNIQUE;
