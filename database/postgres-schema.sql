-- ======================================
-- 0️ Enable pgcrypto extension for UUIDs
-- ======================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================
-- 1️ Create the schema
-- ======================================
CREATE SCHEMA IF NOT EXISTS jenita_dev AUTHORIZATION CURRENT_USER;

-- Set schema for this session
SET search_path TO jenita_dev;

-- ======================================
-- 2️ Tenants Table
-- ======================================
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================
-- 3️ Customers Table
-- ======================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    customer_loyalty_status TEXT,
    customer_address TEXT,
    customer_purchase_frequency INT,
    segment_tag TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, customer_phone),
    UNIQUE (tenant_id, customer_email)
);

-- ======================================
-- 4️ Purchase History Table
-- ======================================
CREATE TABLE IF NOT EXISTS purchase_history (
    purchase_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    item_id TEXT,
    item_name TEXT,
    item_category TEXT,
    item_price NUMERIC(10,2),
    discount_given NUMERIC(10,2),
    purchase_timestamp TIMESTAMPTZ DEFAULT now()
);

-- ======================================
-- 5️ Campaigns Table
-- ======================================
CREATE TABLE IF NOT EXISTS campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    campaign_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================
-- 6️ Engagement History Table
-- ======================================
CREATE TABLE IF NOT EXISTS engagement_history (
    engagement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    no_of_clicks INT DEFAULT 0,
    no_of_opens INT DEFAULT 0,
    replies INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================
-- 7️ Consent Table
-- ======================================
CREATE TABLE IF NOT EXISTS consent (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    email_consent BOOLEAN DEFAULT false,
    sms_consent BOOLEAN DEFAULT false,
    whatsapp_consent BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, customer_id)
);

-- ======================================
-- 8️ Usage Table
-- ======================================
CREATE TABLE IF NOT EXISTS usage (
    usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    preferred_channel TEXT CHECK (preferred_channel IN ('email','sms','whatsapp')),
    preferred_time INT CHECK (preferred_time BETWEEN 0 AND 23),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, customer_id)
);

-- ======================================
-- 9️ Message Status Table
-- ======================================
CREATE TABLE IF NOT EXISTS message_status (
    status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    message_sent BOOLEAN DEFAULT false,
    message_delivered BOOLEAN DEFAULT false,
    message_opened BOOLEAN DEFAULT false,
    message_clicked BOOLEAN DEFAULT false,
    message_failed BOOLEAN DEFAULT false,
    compliance_rejected BOOLEAN DEFAULT false,
    regeneration_triggered BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================
-- 10 Message Log Table
-- ======================================
CREATE TABLE IF NOT EXISTS message_log (
    message_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    channel TEXT CHECK (channel IN ('email','sms','whatsapp')),
    generated_message TEXT,
    compliance_result TEXT CHECK (compliance_result IN ('approved','rejected')),
    prediction_score FLOAT,
    send_timestamp TIMESTAMPTZ,
    provider_message_id TEXT,
    delivery_status TEXT CHECK (
        delivery_status IN ('queued','sent','delivered','failed','opened','clicked')
    ),
    error_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ======================================
-- 11 Indexes for Performance
-- ======================================
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_customer ON purchase_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_message_campaign ON message_log(campaign_id);
CREATE INDEX IF NOT EXISTS idx_message_tenant ON message_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagement_customer ON engagement_history(customer_id);
