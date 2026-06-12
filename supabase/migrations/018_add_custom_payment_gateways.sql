-- Migration 018: Add Custom Payment Gateways to Store Settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS active_gateway TEXT DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS phonepe_merchant_id TEXT,
ADD COLUMN IF NOT EXISTS phonepe_terminal_id TEXT,
ADD COLUMN IF NOT EXISTS googlepay_merchant_id TEXT,
ADD COLUMN IF NOT EXISTS googlepay_terminal_id TEXT,
ADD COLUMN IF NOT EXISTS paytm_merchant_id TEXT,
ADD COLUMN IF NOT EXISTS paytm_terminal_id TEXT,
ADD COLUMN IF NOT EXISTS bharatpe_merchant_id TEXT,
ADD COLUMN IF NOT EXISTS bharatpe_terminal_id TEXT;
