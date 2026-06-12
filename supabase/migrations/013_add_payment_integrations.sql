-- migration: 013_add_payment_integrations.sql
-- Add compatibility fields to table_sessions and bills.

-- 1. Add compatibility columns to table_sessions table
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS check_in_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS check_out_at TIMESTAMPTZ;
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS total_revenue INTEGER DEFAULT 0;
ALTER TABLE public.table_sessions ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL;

-- 4. Sync existing records' check_in_at and check_out_at
UPDATE public.table_sessions 
SET check_in_at = started_at, check_out_at = ended_at
WHERE check_in_at IS NULL OR check_out_at IS NULL;

-- 5. Create trigger function to keep started_at ↔ check_in_at and ended_at ↔ check_out_at synced
CREATE OR REPLACE FUNCTION public.sync_table_sessions_compatibility()
RETURNS TRIGGER AS $$
BEGIN
  -- Sync check_in_at and started_at
  IF NEW.started_at IS NOT NULL AND NEW.check_in_at IS NULL THEN
    NEW.check_in_at := NEW.started_at;
  ELSIF NEW.check_in_at IS NOT NULL AND NEW.started_at IS NULL THEN
    NEW.started_at := NEW.check_in_at;
  END IF;

  -- Sync check_out_at and ended_at
  IF NEW.ended_at IS NOT NULL AND NEW.check_out_at IS NULL THEN
    NEW.check_out_at := NEW.ended_at;
  ELSIF NEW.check_out_at IS NOT NULL AND NEW.ended_at IS NULL THEN
    NEW.ended_at := NEW.check_out_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_table_sessions_compatibility_trig ON public.table_sessions;
CREATE TRIGGER sync_table_sessions_compatibility_trig
BEFORE INSERT OR UPDATE ON public.table_sessions
FOR EACH ROW EXECUTE FUNCTION public.sync_table_sessions_compatibility();


-- 6. Add table_id column to bills table
ALTER TABLE public.bills ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES public.tables(id) ON DELETE SET NULL;
