-- ================================================================
-- Migration 023: Bills Table — Session + Tax + Discount Columns
-- ================================================================
BEGIN;

ALTER TABLE public.bills
  ADD COLUMN IF NOT EXISTS table_session_id    UUID REFERENCES public.table_sessions(id)   ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_session_id UUID REFERENCES public.customer_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS offer_code_id       UUID REFERENCES public.offer_codes(id)       ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subtotal_paise      INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_paise >= 0),
  ADD COLUMN IF NOT EXISTS discount_paise      INTEGER NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  ADD COLUMN IF NOT EXISTS cgst_paise          INTEGER NOT NULL DEFAULT 0 CHECK (cgst_paise >= 0),
  ADD COLUMN IF NOT EXISTS sgst_paise          INTEGER NOT NULL DEFAULT 0 CHECK (sgst_paise >= 0),
  ADD COLUMN IF NOT EXISTS tip_paise           INTEGER NOT NULL DEFAULT 0 CHECK (tip_paise >= 0),
  ADD COLUMN IF NOT EXISTS round_off_paise     INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bills_table_session ON public.bills (table_session_id)
  WHERE table_session_id IS NOT NULL;

-- Auto-increment offer_codes.used_count when bill is created with an offer
CREATE OR REPLACE FUNCTION public.increment_offer_code_usage()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.offer_code_id IS NOT NULL THEN
    UPDATE public.offer_codes
    SET    used_count = used_count + 1
    WHERE  id = NEW.offer_code_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bills_offer_usage ON public.bills;
CREATE TRIGGER trg_bills_offer_usage
  AFTER INSERT ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.increment_offer_code_usage();

-- RPC: generate_table_bill — single source of truth for bill creation
-- Calculates CGST/SGST, applies discount, creates bills record atomically
CREATE OR REPLACE FUNCTION public.generate_table_bill(
  p_order_id            UUID,
  p_payment_method      TEXT,
  p_offer_code_id       UUID    DEFAULT NULL,
  p_discount_paise      INTEGER DEFAULT 0,
  p_tip_paise           INTEGER DEFAULT 0,
  p_table_session_id    UUID    DEFAULT NULL,
  p_customer_session_id UUID    DEFAULT NULL
) RETURNS public.bills
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_subtotal   INTEGER;
  v_cgst       INTEGER;
  v_sgst       INTEGER;
  v_total      INTEGER;
  v_round_off  INTEGER;
  v_bill       public.bills%ROWTYPE;
BEGIN
  -- Sum order items to get subtotal (pre-discount)
  SELECT COALESCE(SUM(oi.unit_price_paise * oi.qty), 0)
  INTO   v_subtotal
  FROM   public.order_items oi
  WHERE  oi.order_id = p_order_id;

  -- Apply discount (floor to 0)
  v_subtotal := GREATEST(0, v_subtotal - p_discount_paise);

  -- CGST 2.5% + SGST 2.5% (both integer-rounded)
  v_cgst := ROUND(v_subtotal * 0.025)::INTEGER;
  v_sgst := ROUND(v_subtotal * 0.025)::INTEGER;

  v_total := v_subtotal + v_cgst + v_sgst + p_tip_paise;

  -- Round off to nearest rupee (100 paise)
  v_round_off := (ROUND(v_total::NUMERIC / 100) * 100) - v_total;
  v_total     := v_total + v_round_off;

  INSERT INTO public.bills (
    order_id, payment_method, total_amount_paise, is_void,
    subtotal_paise, discount_paise, cgst_paise, sgst_paise,
    tip_paise, round_off_paise, offer_code_id,
    table_session_id, customer_session_id
  ) VALUES (
    p_order_id, p_payment_method, v_total, FALSE,
    v_subtotal, p_discount_paise, v_cgst, v_sgst,
    p_tip_paise, v_round_off, p_offer_code_id,
    p_table_session_id, p_customer_session_id
  ) RETURNING * INTO v_bill;

  -- Close the table session
  IF p_table_session_id IS NOT NULL THEN
    UPDATE public.table_sessions
    SET    status = 'closed', session_end = NOW()
    WHERE  id = p_table_session_id;
  END IF;

  -- Update customer total spent
  IF p_customer_session_id IS NOT NULL THEN
    UPDATE public.customer_sessions
    SET    total_spent_paise = total_spent_paise + v_total
    WHERE  id = p_customer_session_id;
  END IF;

  RETURN v_bill;
END;
$$;

COMMIT;
