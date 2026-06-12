-- Migration 017: Add Service Charges to Store Settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS service_charge_type TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS service_charge_value NUMERIC(10, 2) DEFAULT 0.00;
