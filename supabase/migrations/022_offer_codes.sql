-- ================================================================
-- Migration 022: Offer Codes (Canonical Platform Table)
-- ================================================================
BEGIN;

CREATE TABLE public.offer_codes (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        NOT NULL REFERENCES public.tenants(id)   ON DELETE CASCADE,
  branch_id           UUID                 REFERENCES public.branches(id)  ON DELETE SET NULL,
  code                TEXT        NOT NULL,
  description         TEXT,
  discount_type       TEXT        NOT NULL CHECK (discount_type IN ('percentage','flat')),
  discount_value      INTEGER     NOT NULL CHECK (discount_value > 0),
  min_order_paise     INTEGER     NOT NULL DEFAULT 0,
  max_discount_paise  INTEGER,
  applicable_to       TEXT        NOT NULL DEFAULT 'all'
                        CHECK (applicable_to IN ('all','table','customer','category','item')),
  target_ids          UUID[]      NOT NULL DEFAULT '{}',
  valid_from          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until         TIMESTAMPTZ,
  usage_limit         INTEGER,
  used_count          INTEGER     NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by          UUID                 REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code),
  CONSTRAINT valid_percentage_range CHECK (
    discount_type != 'percentage' OR discount_value <= 10000
  )
);

CREATE INDEX idx_offer_codes_tenant_active ON public.offer_codes (tenant_id, is_active);
CREATE INDEX idx_offer_codes_code          ON public.offer_codes (tenant_id, UPPER(code));

ALTER TABLE public.offer_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offer_codes__staff_read"
  ON public.offer_codes FOR SELECT
  USING (
    is_active = TRUE
    AND tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "offer_codes__manager_write"
  ON public.offer_codes FOR ALL
  USING (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  )
  WITH CHECK (
    tenant_id = (
      SELECT p.tenant_id FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('owner','manager')
    )
  );

-- RPC: Validate offer code before applying (called by Flutter app)
CREATE OR REPLACE FUNCTION public.validate_offer_code(
  p_tenant_id   UUID,
  p_code        TEXT,
  p_subtotal    INTEGER
) RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_offer    public.offer_codes%ROWTYPE;
  v_discount INTEGER;
BEGIN
  SELECT * INTO v_offer
  FROM public.offer_codes
  WHERE tenant_id  = p_tenant_id
    AND UPPER(code) = UPPER(p_code)
    AND is_active  = TRUE
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', FALSE, 'error', 'Invalid or expired offer code');
  END IF;

  IF p_subtotal < v_offer.min_order_paise THEN
    RETURN jsonb_build_object(
      'valid', FALSE,
      'error', format('Minimum order ₹%s required', (v_offer.min_order_paise / 100)::TEXT)
    );
  END IF;

  IF v_offer.discount_type = 'percentage' THEN
    v_discount := ROUND((p_subtotal::NUMERIC * v_offer.discount_value) / 10000)::INTEGER;
    IF v_offer.max_discount_paise IS NOT NULL THEN
      v_discount := LEAST(v_discount, v_offer.max_discount_paise);
    END IF;
  ELSE
    v_discount := LEAST(v_offer.discount_value, p_subtotal);
  END IF;

  RETURN jsonb_build_object(
    'valid',          TRUE,
    'offer_id',       v_offer.id,
    'discount_paise', v_discount,
    'description',    v_offer.description,
    'code',           v_offer.code
  );
END;
$$;

COMMIT;
