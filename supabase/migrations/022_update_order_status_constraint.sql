-- Update orders status check constraint to support 'billed' and 'paid'
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'billed', 'paid', 'cancelled'));
