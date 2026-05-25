-- migrate:skip-if-populated crm_roles

INSERT INTO crm_roles (name, persona_type, permissions) VALUES
  ('crm_super_admin', 'employee', '["*"]'::jsonb),
  ('crm_employee', 'employee', '["dashboard","lead_sources","prospects","companies","contacts","calls","communications","meetings","proposals","follow_ups","pipeline","revenue","commission","files","ai_log","admin"]'::jsonb),
  ('crm_affiliate', 'affiliate', '["dashboard","prospects","companies","contacts","calls","communications","meetings","proposals","follow_ups","pipeline","commission","files"]'::jsonb),
  ('crm_developer', 'developer', '["dashboard","prospects","companies","contacts","calls","communications","meetings","proposals","follow_ups","pipeline","commission","files"]'::jsonb),
  ('crm_authorized_rep', 'authorized_rep', '["dashboard","prospects","companies","contacts","calls","communications","meetings","proposals","follow_ups","pipeline","commission","files"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO crm_pipeline_phases (name, sort_order) VALUES
  ('Identified', 1), ('Qualified', 2), ('Discovery', 3), ('Solution Design', 4),
  ('Proposal Shared', 5), ('Negotiation', 6), ('Legal Review', 7), ('Contract Sent', 8),
  ('Contract Executed', 9), ('Implementation', 10), ('Live', 11), ('Revenue Active', 12),
  ('Closed Won', 13), ('Closed Lost', 14), ('Dormant', 15)
ON CONFLICT (name) DO NOTHING;

INSERT INTO crm_lead_source_types (name) VALUES
  ('Direct Sales'), ('Affiliate'), ('Developer'), ('Authorized Rep'), ('Website'),
  ('Webinar'), ('Event'), ('Social Media'), ('LinkedIn'), ('X'), ('Instagram'),
  ('Email Campaign'), ('Referral'), ('Strategic Partner'), ('AI Scout'), ('Manual Entry'), ('Imported List')
ON CONFLICT (name) DO NOTHING;

INSERT INTO crm_countries (code, name) VALUES
  ('IE', 'Ireland'), ('GB', 'United Kingdom'), ('US', 'United States'),
  ('DE', 'Germany'), ('FR', 'France'), ('NL', 'Netherlands')
ON CONFLICT DO NOTHING;

INSERT INTO crm_industries (name) VALUES
  ('Technology'), ('Financial Services'), ('Telecommunications'), ('Healthcare'),
  ('Energy'), ('Government'), ('Retail'), ('Manufacturing')
ON CONFLICT (name) DO NOTHING;

INSERT INTO crm_business_types (name) VALUES
  ('Enterprise'), ('SMB'), ('Startup'), ('Government'), ('Non-Profit')
ON CONFLICT (name) DO NOTHING;

INSERT INTO crm_admin_settings (key, value) VALUES
  ('ciright_core_sync', '{"status":"pending","last_sync":null}'::jsonb),
  ('commission_rules', '{"payable_after_cash_collected":true,"split_attribution_enabled":true}'::jsonb),
  ('revenue_rules', '{"recognition_on_cash_collected":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Demo lead source
INSERT INTO crm_lead_sources (source_name, source_type, description, status)
SELECT 'Keyra Website — Enterprise Inquiry', 'Website', 'Organic inbound from crm.keyra.ie', 'active'
WHERE NOT EXISTS (SELECT 1 FROM crm_lead_sources LIMIT 1);

-- Demo company & contact
INSERT INTO crm_companies (
  company_name, country, industry, business_type, domain, primary_website,
  customer_owner_type, lifecycle_stage, account_status
)
SELECT 'Acme Telecom Group', 'IE', 'Telecommunications', 'Enterprise', 'acmetelecom.ie',
  'https://acmetelecom.ie', 'Keyra Direct', 'Customer', 'active'
WHERE NOT EXISTS (SELECT 1 FROM crm_companies LIMIT 1);

INSERT INTO crm_contacts (company_id, first_name, last_name, full_name, title, email, decision_role, relationship_strength_score)
SELECT c.company_id, 'Sarah', 'O''Brien', 'Sarah O''Brien', 'Chief Technology Officer',
  's.obrien@acmetelecom.ie', 'Decision Maker', 85
FROM crm_companies c
WHERE c.company_name = 'Acme Telecom Group'
  AND NOT EXISTS (SELECT 1 FROM crm_contacts LIMIT 1);

INSERT INTO crm_prospects (prospect_name, prospect_type, company_name, email, country, industry, status, lead_source_id)
SELECT 'Nordic Cloud Systems', 'Organization', 'Nordic Cloud Systems', 'info@nordiccloud.se', 'SE', 'Technology', 'Qualified', ls.lead_source_id
FROM crm_lead_sources ls
WHERE NOT EXISTS (SELECT 1 FROM crm_prospects LIMIT 1)
LIMIT 1;

INSERT INTO crm_pipeline (
  opportunity_name, primary_company_id, contract_phase, expected_contract_value,
  expected_annual_revenue, probability, forecast_close_date
)
SELECT 'Acme — Keyra Platform License', c.company_id, 'Proposal Shared', 250000, 120000, 65, CURRENT_DATE + INTERVAL '45 days'
FROM crm_companies c WHERE c.company_name = 'Acme Telecom Group'
  AND NOT EXISTS (SELECT 1 FROM crm_pipeline LIMIT 1);

INSERT INTO crm_follow_ups (company_id, follow_up_type, priority, due_date, status, notes)
SELECT c.company_id, 'Call', 'High', CURRENT_DATE, 'Open', 'Executive follow-up on proposal review'
FROM crm_companies c WHERE c.company_name = 'Acme Telecom Group'
  AND NOT EXISTS (SELECT 1 FROM crm_follow_ups LIMIT 1);
