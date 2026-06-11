-- migration: 012_add_attended_fields_to_staff_calls.sql
-- Add attended_by and attended_at columns to staff_calls table

ALTER TABLE public.staff_calls ADD COLUMN IF NOT EXISTS attended_by UUID REFERENCES public.staff_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.staff_calls ADD COLUMN IF NOT EXISTS attended_at TIMESTAMPTZ;
