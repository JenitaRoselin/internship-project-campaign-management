-- ======================================
-- Enhanced Campaign Schema with CRM Fields
-- ======================================

-- Add new columns to campaigns table for CRM-style campaign management
ALTER TABLE jenita_dev.campaigns 
ADD COLUMN IF NOT EXISTS budget NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'English',
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS tone TEXT,
ADD COLUMN IF NOT EXISTS target_audience_filter JSONB,
ADD COLUMN IF NOT EXISTS smart_context TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
ADD COLUMN IF NOT EXISTS run_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ;

-- Add campaign details table for storing segment-specific messages
CREATE TABLE IF NOT EXISTS jenita_dev.campaign_details (
    detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES jenita_dev.campaigns(campaign_id) ON DELETE CASCADE,
    segment_name TEXT NOT NULL,
    is_recommended BOOLEAN DEFAULT false,
    generated_message TEXT,
    customer_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_campaign_details_campaign ON jenita_dev.campaign_details(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant ON jenita_dev.campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON jenita_dev.campaigns(status);

COMMENT ON TABLE jenita_dev.campaign_details IS 'Stores segment-specific generated messages for each campaign';
COMMENT ON COLUMN jenita_dev.campaigns.budget IS 'Campaign budget in currency units';
COMMENT ON COLUMN jenita_dev.campaigns.objective IS 'Campaign objective (e.g., Sales, Engagement, Retention, or custom)';
COMMENT ON COLUMN jenita_dev.campaigns.tone IS 'Message tone (e.g., Professional, Friendly, Urgent, or custom)';
COMMENT ON COLUMN jenita_dev.campaigns.target_audience_filter IS 'JSON storing audience filter criteria';
COMMENT ON COLUMN jenita_dev.campaigns.smart_context IS 'Additional context for AI message generation';
