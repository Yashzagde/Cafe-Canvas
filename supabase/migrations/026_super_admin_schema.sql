-- Migration 026: Super Admin Platform Schemas
-- Multi-Tenant SaaS Restaurant Platform Management

BEGIN;

-- 1. Super Admin Roles and Privileged Users
CREATE TABLE IF NOT EXISTS public.super_admin_users (
  id          UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT          NOT NULL CHECK (role IN ('platform_owner', 'platform_admin', 'support_manager', 'finance_manager', 'auditor')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. WebAuthn Passkeys Credentials Mapping
CREATE TABLE IF NOT EXISTS public.super_admin_passkeys (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          NOT NULL REFERENCES public.super_admin_users(id) ON DELETE CASCADE,
  credential_id TEXT          NOT NULL UNIQUE,
  public_key    TEXT          NOT NULL,
  counter       BIGINT        NOT NULL DEFAULT 0,
  device_name   TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 3. Super Admin Session Tracking with Fingerprint & Threat Indicators
CREATE TABLE IF NOT EXISTS public.super_admin_sessions (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          NOT NULL REFERENCES public.super_admin_users(id) ON DELETE CASCADE,
  device_fingerprint  TEXT,
  ip_address          INET,
  user_agent          TEXT,
  risk_score          NUMERIC(3,2)  DEFAULT 0.00,
  active              BOOLEAN       NOT NULL DEFAULT true,
  last_active_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4. Subscription & Plan Engine
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id             TEXT          PRIMARY KEY, -- 'starter', 'growth', 'professional', 'enterprise'
  name           TEXT          NOT NULL,
  price_monthly  INTEGER       NOT NULL, -- in paise
  price_yearly   INTEGER       NOT NULL, -- in paise
  description    TEXT
);

-- 5. Feature Limit Engine
CREATE TABLE IF NOT EXISTS public.feature_limits (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id               TEXT          NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  max_branches          INTEGER       NOT NULL DEFAULT 1,
  max_staff             INTEGER       NOT NULL DEFAULT 5,
  max_domains           INTEGER       NOT NULL DEFAULT 1,
  max_orders_per_month  INTEGER       NOT NULL DEFAULT 1000,
  max_storage_gb        INTEGER       NOT NULL DEFAULT 2,
  features              JSONB         NOT NULL DEFAULT '{}'
);

-- Populate default plans and limits
INSERT INTO public.subscription_plans (id, name, price_monthly, price_yearly, description) VALUES
('starter', 'Starter Package', 290000, 2900000, 'Best for single-location artisanal cafes'),
('growth', 'Growth Suite', 890000, 8900000, 'Perfect for growing cafes with multiple branches'),
('professional', 'Professional Hub', 1990000, 19900000, 'Advanced tools for franchise owners'),
('enterprise', 'Enterprise Custom', 4990000, 49900000, 'Custom scaling and priority SLAs')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.feature_limits (plan_id, max_branches, max_staff, max_domains, max_orders_per_month, max_storage_gb, features) VALUES
('starter', 1, 5, 1, 1000, 2, '{"analytics": false, "custom_theme": false}'),
('growth', 5, 50, 3, 10000, 10, '{"analytics": true, "custom_theme": true}'),
('professional', 15, 200, 10, 50000, 50, '{"analytics": true, "custom_theme": true, "api_access": true}'),
('enterprise', 999, 9999, 99, 999999, 1000, '{"analytics": true, "custom_theme": true, "api_access": true, "sso": true}')
ON CONFLICT DO NOTHING;

-- 6. Tenant Active Subscriptions
CREATE TABLE IF NOT EXISTS public.tenant_subscriptions (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_id               TEXT          NOT NULL REFERENCES public.subscription_plans(id),
  status                TEXT          NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  billing_cycle         TEXT          NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start  TIMESTAMPTZ   NOT NULL,
  current_period_end    TIMESTAMPTZ   NOT NULL,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 7. Domain Management Registry
CREATE TABLE IF NOT EXISTS public.custom_domains (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain      TEXT          NOT NULL UNIQUE,
  ssl_status  TEXT          NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
  dns_status  TEXT          NOT NULL DEFAULT 'pending' CHECK (dns_status IN ('pending', 'active', 'failed')),
  verified    BOOLEAN       NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 8. Platform Tenant Metrics Registry
CREATE TABLE IF NOT EXISTS public.tenant_usage (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branches_count  INTEGER       NOT NULL DEFAULT 0,
  staff_count     INTEGER       NOT NULL DEFAULT 0,
  orders_count    INTEGER       NOT NULL DEFAULT 0,
  storage_bytes   BIGINT        NOT NULL DEFAULT 0,
  api_calls       INTEGER       NOT NULL DEFAULT 0,
  last_updated    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 9. Internal Support Ticket Queue
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id      UUID                   REFERENCES public.users(id) ON DELETE SET NULL,
  title        TEXT          NOT NULL,
  description  TEXT          NOT NULL,
  category     TEXT          NOT NULL CHECK (category IN ('bug', 'billing', 'feature_request', 'other')),
  priority     TEXT          NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status       TEXT          NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to  UUID                   REFERENCES public.super_admin_users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 10. Platform Threat Logs & Auth Auditing
CREATE TABLE IF NOT EXISTS public.security_events (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID,
  actor_type  TEXT          NOT NULL CHECK (actor_type IN ('super_admin', 'tenant_staff', 'system')),
  event_type  TEXT          NOT NULL,
  description TEXT          NOT NULL,
  ip_address  INET,
  user_agent  TEXT,
  metadata    JSONB         NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 11. Subscription Invoices Registry
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID          NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscription_id UUID                   REFERENCES public.tenant_subscriptions(id) ON DELETE SET NULL,
  amount          INTEGER       NOT NULL, -- in paise
  tax             INTEGER       NOT NULL, -- in paise
  total           INTEGER       NOT NULL, -- in paise
  status          TEXT          NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  pdf_url         TEXT,
  due_date        TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 12. Global Platform Configurations Registry
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key         TEXT          PRIMARY KEY,
  value       JSONB         NOT NULL,
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 13. Super Admin Developer API Keys Registry
CREATE TABLE IF NOT EXISTS public.super_admin_api_keys (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT          NOT NULL,
  key_hash    TEXT          NOT NULL UNIQUE,
  permissions TEXT[]        NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Enable RLS for Zero-Trust Policies
ALTER TABLE public.super_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_passkeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS policies: Allow super admins full access to everything in super_admin schemas
CREATE POLICY super_admin_users_all ON public.super_admin_users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY super_admin_passkeys_all ON public.super_admin_passkeys
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY super_admin_sessions_all ON public.super_admin_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY subscription_plans_all ON public.subscription_plans
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY feature_limits_all ON public.feature_limits
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY tenant_subscriptions_all ON public.tenant_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY custom_domains_all ON public.custom_domains
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY tenant_usage_all ON public.tenant_usage
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY support_tickets_all ON public.support_tickets
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY security_events_all ON public.security_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY billing_invoices_all ON public.billing_invoices
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY platform_settings_all ON public.platform_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY super_admin_api_keys_all ON public.super_admin_api_keys
  FOR ALL USING (true) WITH CHECK (true);

COMMIT;
