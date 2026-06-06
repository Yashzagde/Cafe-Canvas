-- =========================================================================
-- CafeCanvas — Custom Roles, Read Status, & Bill Customer Phone
-- =========================================================================

-- 1. Drop rigid check constraints on staff_accounts role to support chef, bartender, waiter, etc.
ALTER TABLE public.staff_accounts DROP CONSTRAINT IF EXISTS staff_accounts_role_check;

-- 2. Drop rigid check constraints on notification_log type to support customer_checkin, custom notifications, etc.
ALTER TABLE public.notification_log DROP CONSTRAINT IF EXISTS notification_log_type_check;

-- 3. Add read status column to notification_log
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- 4. Add customer_phone to bills to track who the bill was generated for
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS customer_phone TEXT;
