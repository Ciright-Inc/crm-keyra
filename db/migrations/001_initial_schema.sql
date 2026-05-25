-- crm.keyra.ie — Keyra Enterprise CRM Schema
-- PostgreSQL (keyra-auth database, crm_* prefixed tables)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── RBAC & Personas ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) UNIQUE NOT NULL,
  persona_type VARCHAR(32) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_type VARCHAR(32) NOT NULL CHECK (persona_type IN (
    'employee', 'affiliate', 'developer', 'authorized_rep'
  )),
  auth_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  affiliate_id UUID REFERENCES affiliate_accounts(id) ON DELETE SET NULL,
  developer_id UUID REFERENCES developer_accounts(id) ON DELETE SET NULL,
  display_name VARCHAR(255),
  email VARCHAR(255),
  status VARCHAR(32) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_user_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id INT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES crm_personas(id) ON DELETE SET NULL,
  role_id INT REFERENCES crm_roles(id),
  visibility_scope VARCHAR(32) DEFAULT 'internal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(auth_user_id)
);

-- ─── Audit & AI ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id INT,
  persona_id UUID,
  action VARCHAR(128) NOT NULL,
  entity_type VARCHAR(64),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_audit_entity ON crm_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_crm_audit_created ON crm_audit_log(created_at DESC);

CREATE TABLE IF NOT EXISTS crm_ai_activity_log (
  ai_activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai_agent_name VARCHAR(128) NOT NULL,
  activity_type VARCHAR(64) NOT NULL,
  source_entity_type VARCHAR(64),
  source_entity_id UUID,
  target_company_id UUID,
  target_contact_id UUID,
  prompt_used TEXT,
  output_summary TEXT,
  action_taken TEXT,
  human_approved_boolean BOOLEAN DEFAULT FALSE,
  approved_by_user_id INT,
  risk_flag BOOLEAN DEFAULT FALSE,
  compliance_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Admin lookups ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_countries (code VARCHAR(8) PRIMARY KEY, name VARCHAR(128) NOT NULL);
CREATE TABLE IF NOT EXISTS crm_industries (id SERIAL PRIMARY KEY, name VARCHAR(128) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS crm_business_types (id SERIAL PRIMARY KEY, name VARCHAR(128) UNIQUE NOT NULL);
CREATE TABLE IF NOT EXISTS crm_pipeline_phases (id SERIAL PRIMARY KEY, name VARCHAR(64) UNIQUE NOT NULL, sort_order INT DEFAULT 0);
CREATE TABLE IF NOT EXISTS crm_lead_source_types (id SERIAL PRIMARY KEY, name VARCHAR(64) UNIQUE NOT NULL);

-- ─── Lead Sources ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_lead_sources (
  lead_source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(64) NOT NULL,
  description TEXT,
  source_persona_type VARCHAR(32),
  source_persona_id UUID,
  affiliate_id UUID REFERENCES affiliate_accounts(id) ON DELETE SET NULL,
  developer_id UUID REFERENCES developer_accounts(id) ON DELETE SET NULL,
  rep_id UUID,
  employee_auth_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  campaign_id VARCHAR(128),
  website_url TEXT,
  landing_page_url TEXT,
  referral_url TEXT,
  social_network VARCHAR(64),
  ip_address INET,
  device_fingerprint VARCHAR(255),
  utm_source VARCHAR(128),
  utm_medium VARCHAR(128),
  utm_campaign VARCHAR(128),
  utm_content VARCHAR(128),
  utm_term VARCHAR(128),
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  status VARCHAR(32) DEFAULT 'active',
  visibility VARCHAR(32) DEFAULT 'internal',
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crm_lead_sources_type ON crm_lead_sources(source_type);

-- ─── Prospects ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_prospects (
  prospect_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prospect_name VARCHAR(512),
  prospect_type VARCHAR(32) NOT NULL CHECK (prospect_type IN ('Individual', 'Organization')),
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  company_name VARCHAR(512),
  email VARCHAR(255),
  mobile VARCHAR(64),
  title VARCHAR(255),
  country VARCHAR(8),
  industry VARCHAR(128),
  business_type VARCHAR(128),
  lead_source_id UUID REFERENCES crm_lead_sources(lead_source_id) ON DELETE SET NULL,
  assigned_lead_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  assigned_support_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  assigned_management_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(64) DEFAULT 'New',
  notes TEXT,
  ai_summary TEXT,
  converted_to_company_id UUID,
  converted_to_contact_id UUID,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  updated_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal',
  source_attribution JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crm_prospects_status ON crm_prospects(status);
CREATE INDEX IF NOT EXISTS idx_crm_prospects_lead_source ON crm_prospects(lead_source_id);

-- ─── Companies ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_companies (
  company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ciright_core_company_id VARCHAR(128),
  company_name VARCHAR(512) NOT NULL,
  country VARCHAR(8),
  state_region VARCHAR(128),
  city VARCHAR(128),
  business_type VARCHAR(128),
  industry VARCHAR(128),
  domain VARCHAR(255),
  primary_website TEXT,
  lead_source_id UUID REFERENCES crm_lead_sources(lead_source_id) ON DELETE SET NULL,
  customer_owner_type VARCHAR(32) DEFAULT 'Keyra Direct',
  lead_assigned_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  support_assigned_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  management_assigned_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  lifecycle_stage VARCHAR(64),
  account_status VARCHAR(64) DEFAULT 'active',
  ai_relationship_summary TEXT,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  updated_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal',
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crm_companies_name ON crm_companies USING gin (company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_crm_companies_country ON crm_companies(country);
CREATE INDEX IF NOT EXISTS idx_crm_companies_industry ON crm_companies(industry);

ALTER TABLE crm_prospects
  ADD CONSTRAINT fk_prospect_company FOREIGN KEY (converted_to_company_id)
  REFERENCES crm_companies(company_id) ON DELETE SET NULL;

-- ─── Contacts ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_contacts (
  contact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  ciright_core_contact_id VARCHAR(128),
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  full_name VARCHAR(255),
  title VARCHAR(255),
  department VARCHAR(128),
  email VARCHAR(255),
  mobile VARCHAR(64),
  country VARCHAR(8),
  linkedin_url TEXT,
  x_url TEXT,
  instagram_url TEXT,
  other_social_links JSONB DEFAULT '[]'::jsonb,
  lead_owner_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  support_owner_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  management_owner_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  relationship_strength_score DECIMAL(5,2) DEFAULT 0,
  decision_role VARCHAR(64) DEFAULT 'Unknown',
  notes TEXT,
  ai_summary TEXT,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(32) DEFAULT 'active',
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  updated_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON crm_contacts(company_id);

ALTER TABLE crm_prospects
  ADD CONSTRAINT fk_prospect_contact FOREIGN KEY (converted_to_contact_id)
  REFERENCES crm_contacts(contact_id) ON DELETE SET NULL;

-- ─── Calls ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_calls (
  call_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  primary_contact_id UUID REFERENCES crm_contacts(contact_id) ON DELETE SET NULL,
  call_type VARCHAR(64) NOT NULL,
  call_datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INT,
  participants TEXT,
  call_notes TEXT,
  call_summary TEXT,
  ai_transcript_summary TEXT,
  next_action TEXT,
  follow_up_id UUID,
  recording_url TEXT,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE TABLE IF NOT EXISTS crm_call_contacts (
  call_id UUID NOT NULL REFERENCES crm_calls(call_id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(contact_id) ON DELETE CASCADE,
  PRIMARY KEY (call_id, contact_id)
);

CREATE TABLE IF NOT EXISTS crm_call_users (
  call_id UUID NOT NULL REFERENCES crm_calls(call_id) ON DELETE CASCADE,
  auth_user_id INT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  PRIMARY KEY (call_id, auth_user_id)
);

-- ─── Communications ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_communications (
  communication_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(contact_id) ON DELETE SET NULL,
  communication_type VARCHAR(64) NOT NULL,
  direction VARCHAR(16) NOT NULL CHECK (direction IN ('Inbound', 'Outbound')),
  subject VARCHAR(512),
  body TEXT,
  date_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_by_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  received_by_contact_id UUID REFERENCES crm_contacts(contact_id) ON DELETE SET NULL,
  platform VARCHAR(64),
  message_status VARCHAR(64),
  ai_generated_boolean BOOLEAN DEFAULT FALSE,
  ai_agent_name VARCHAR(128),
  campaign_id VARCHAR(128),
  related_follow_up_id UUID,
  related_proposal_id UUID,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE INDEX IF NOT EXISTS idx_crm_comms_company ON crm_communications(company_id, date_time DESC);

-- ─── Meetings ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_meetings (
  meeting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  meeting_type VARCHAR(64) NOT NULL,
  event_id UUID,
  event_object_type VARCHAR(64),
  meeting_title VARCHAR(512) NOT NULL,
  location TEXT,
  virtual_link TEXT,
  meeting_datetime TIMESTAMPTZ NOT NULL,
  agenda TEXT,
  notes TEXT,
  ai_summary TEXT,
  outcomes TEXT,
  follow_up_id UUID,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE TABLE IF NOT EXISTS crm_meeting_contacts (
  meeting_id UUID NOT NULL REFERENCES crm_meetings(meeting_id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(contact_id) ON DELETE CASCADE,
  PRIMARY KEY (meeting_id, contact_id)
);

CREATE TABLE IF NOT EXISTS crm_meeting_users (
  meeting_id UUID NOT NULL REFERENCES crm_meetings(meeting_id) ON DELETE CASCADE,
  auth_user_id INT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  PRIMARY KEY (meeting_id, auth_user_id)
);

-- ─── Proposals ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_proposals (
  proposal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  proposal_name VARCHAR(512) NOT NULL,
  proposal_type VARCHAR(64) NOT NULL,
  shared_datetime TIMESTAMPTZ,
  shared_by_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  document_url TEXT,
  version VARCHAR(32) DEFAULT '1.0',
  description TEXT,
  status VARCHAR(64) DEFAULT 'Draft',
  ai_outbound_agent VARCHAR(128),
  bd_scout_automation_source VARCHAR(128),
  email_file_source VARCHAR(128),
  related_pipeline_id UUID,
  related_follow_up_id UUID,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE TABLE IF NOT EXISTS crm_proposal_contacts (
  proposal_id UUID NOT NULL REFERENCES crm_proposals(proposal_id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(contact_id) ON DELETE CASCADE,
  PRIMARY KEY (proposal_id, contact_id)
);

CREATE TABLE IF NOT EXISTS crm_proposal_companies (
  proposal_id UUID NOT NULL REFERENCES crm_proposals(proposal_id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  PRIMARY KEY (proposal_id, company_id)
);

-- ─── Follow-ups ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_follow_ups (
  follow_up_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(contact_id) ON DELETE SET NULL,
  assigned_to_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_by_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  follow_up_type VARCHAR(64) NOT NULL,
  priority VARCHAR(16) DEFAULT 'Medium',
  due_date DATE NOT NULL,
  due_time TIME,
  status VARCHAR(32) DEFAULT 'Open',
  notes TEXT,
  related_call_id UUID REFERENCES crm_calls(call_id) ON DELETE SET NULL,
  related_email_id UUID REFERENCES crm_communications(communication_id) ON DELETE SET NULL,
  related_meeting_id UUID REFERENCES crm_meetings(meeting_id) ON DELETE SET NULL,
  related_proposal_id UUID REFERENCES crm_proposals(proposal_id) ON DELETE SET NULL,
  related_pipeline_id UUID,
  ai_recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE INDEX IF NOT EXISTS idx_crm_follow_ups_due ON crm_follow_ups(due_date, status);

ALTER TABLE crm_calls ADD CONSTRAINT fk_call_follow_up FOREIGN KEY (follow_up_id)
  REFERENCES crm_follow_ups(follow_up_id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;

-- ─── Pipeline / Contracts ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_pipeline (
  pipeline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id VARCHAR(128),
  opportunity_name VARCHAR(512) NOT NULL,
  primary_company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  lead_source_id UUID REFERENCES crm_lead_sources(lead_source_id) ON DELETE SET NULL,
  owner_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  customer_owner_type VARCHAR(32) DEFAULT 'Direct',
  contract_phase VARCHAR(64) DEFAULT 'Identified',
  expected_contract_value DECIMAL(18,2),
  expected_monthly_revenue DECIMAL(18,2),
  expected_annual_revenue DECIMAL(18,2),
  probability DECIMAL(5,2) DEFAULT 0,
  forecast_close_date DATE,
  revenue_recognition_status VARCHAR(64),
  cash_collection_status VARCHAR(64),
  commission_status VARCHAR(64),
  notes TEXT,
  ai_summary TEXT,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_date TIMESTAMPTZ,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  updated_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE TABLE IF NOT EXISTS crm_pipeline_companies (
  pipeline_id UUID NOT NULL REFERENCES crm_pipeline(pipeline_id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  PRIMARY KEY (pipeline_id, company_id)
);

CREATE TABLE IF NOT EXISTS crm_pipeline_contacts (
  pipeline_id UUID NOT NULL REFERENCES crm_pipeline(pipeline_id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(contact_id) ON DELETE CASCADE,
  PRIMARY KEY (pipeline_id, contact_id)
);

CREATE TABLE IF NOT EXISTS crm_contract_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID NOT NULL REFERENCES crm_pipeline(pipeline_id) ON DELETE CASCADE,
  player_role VARCHAR(64) NOT NULL,
  persona_type VARCHAR(32),
  persona_id UUID,
  auth_user_id INT REFERENCES auth_users(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES crm_contacts(contact_id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm_companies(company_id) ON DELETE SET NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE crm_follow_ups ADD CONSTRAINT fk_follow_pipeline FOREIGN KEY (related_pipeline_id)
  REFERENCES crm_pipeline(pipeline_id) ON DELETE SET NULL;

ALTER TABLE crm_proposals ADD CONSTRAINT fk_proposal_pipeline FOREIGN KEY (related_pipeline_id)
  REFERENCES crm_pipeline(pipeline_id) ON DELETE SET NULL;

-- ─── Revenue Recognition ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_revenue_recognition (
  revenue_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES crm_pipeline(pipeline_id) ON DELETE SET NULL,
  contract_id VARCHAR(128),
  company_id UUID NOT NULL REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  invoice_id VARCHAR(128),
  revenue_type VARCHAR(64),
  gross_revenue DECIMAL(18,2),
  net_revenue DECIMAL(18,2),
  currency VARCHAR(8) DEFAULT 'EUR',
  billing_date DATE,
  payment_due_date DATE,
  payment_received_date DATE,
  cash_collected_boolean BOOLEAN DEFAULT FALSE,
  bank_settlement_date DATE,
  revenue_recognized_date DATE,
  recognition_status VARCHAR(64) DEFAULT 'Forecast',
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE INDEX IF NOT EXISTS idx_crm_revenue_pipeline ON crm_revenue_recognition(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_crm_revenue_status ON crm_revenue_recognition(recognition_status);

-- ─── Commission Attribution ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_commission_attribution (
  commission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_id UUID REFERENCES crm_pipeline(pipeline_id) ON DELETE SET NULL,
  revenue_id UUID REFERENCES crm_revenue_recognition(revenue_id) ON DELETE SET NULL,
  contract_id VARCHAR(128),
  company_id UUID REFERENCES crm_companies(company_id) ON DELETE SET NULL,
  lead_source_id UUID REFERENCES crm_lead_sources(lead_source_id) ON DELETE SET NULL,
  persona_type VARCHAR(32) NOT NULL,
  persona_id UUID,
  commission_role VARCHAR(64),
  attribution_percentage DECIMAL(5,2) DEFAULT 100,
  commission_rate DECIMAL(8,4),
  gross_commission_amount DECIMAL(18,2),
  payable_commission_amount DECIMAL(18,2),
  payment_status VARCHAR(64) DEFAULT 'Pending Cash Collection',
  bank_activation_date DATE,
  settlement_due_date DATE,
  settlement_paid_date DATE,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

-- ─── Files & Comments ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_files (
  file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(512) NOT NULL,
  file_type VARCHAR(64),
  file_url TEXT NOT NULL,
  uploaded_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT,
  version VARCHAR(32) DEFAULT '1.0',
  permission_level VARCHAR(32) DEFAULT 'internal',
  ai_indexed_boolean BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS crm_entity_files (
  entity_type VARCHAR(64) NOT NULL,
  entity_id UUID NOT NULL,
  file_id UUID NOT NULL REFERENCES crm_files(file_id) ON DELETE CASCADE,
  PRIMARY KEY (entity_type, entity_id, file_id)
);

CREATE TABLE IF NOT EXISTS crm_comments (
  comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  body TEXT NOT NULL,
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visibility VARCHAR(32) DEFAULT 'internal'
);

CREATE TABLE IF NOT EXISTS crm_entity_comments (
  entity_type VARCHAR(64) NOT NULL,
  entity_id UUID NOT NULL,
  comment_id UUID NOT NULL REFERENCES crm_comments(comment_id) ON DELETE CASCADE,
  PRIMARY KEY (entity_type, entity_id, comment_id)
);

-- ─── Timeline events (denormalized activity feed) ───────────────────────────

CREATE TABLE IF NOT EXISTS crm_timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES crm_companies(company_id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(contact_id) ON DELETE SET NULL,
  event_type VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64) NOT NULL,
  entity_id UUID NOT NULL,
  title VARCHAR(512) NOT NULL,
  summary TEXT,
  event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by INT REFERENCES auth_users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_crm_timeline_company ON crm_timeline_events(company_id, event_at DESC);

-- ─── Ciright Core sync ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_ciright_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sync_type VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64),
  records_synced INT DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS crm_admin_settings (
  key VARCHAR(128) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by INT REFERENCES auth_users(id) ON DELETE SET NULL
);

-- ─── Row-level security helpers (views for persona scoping) ───────────────────

CREATE OR REPLACE VIEW crm_v_user_context AS
SELECT
  ua.auth_user_id,
  ua.persona_id,
  p.persona_type,
  p.affiliate_id,
  p.developer_id,
  r.permissions
FROM crm_user_access ua
LEFT JOIN crm_personas p ON p.id = ua.persona_id
LEFT JOIN crm_roles r ON r.id = ua.role_id;
