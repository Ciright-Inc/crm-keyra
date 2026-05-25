-- migrate:skip-if-populated crm_revenue_recognition

-- Extra demo rows so dashboard charts and entity lists are populated (Railway / fresh DB).

INSERT INTO auth_users (email, display_name, status)
SELECT 'demo.user@keyra.ie', 'Demo User', 'active'
WHERE NOT EXISTS (SELECT 1 FROM auth_users WHERE email = 'demo.user@keyra.ie');

INSERT INTO crm_lead_sources (source_name, source_type, description, status)
SELECT 'LinkedIn Outbound', 'LinkedIn', 'Enterprise outbound campaign', 'active'
WHERE NOT EXISTS (SELECT 1 FROM crm_lead_sources WHERE source_name = 'LinkedIn Outbound');

INSERT INTO crm_lead_sources (source_name, source_type, description, status)
SELECT 'Strategic Partner — Telco', 'Strategic Partner', 'Partner referral channel', 'active'
WHERE NOT EXISTS (SELECT 1 FROM crm_lead_sources WHERE source_name = 'Strategic Partner — Telco');

INSERT INTO crm_companies (company_name, country, industry, business_type, domain, lifecycle_stage, account_status)
SELECT 'Nordic Cloud Systems', 'SE', 'Technology', 'Enterprise', 'nordiccloud.se', 'Prospect', 'active'
WHERE NOT EXISTS (SELECT 1 FROM crm_companies WHERE company_name = 'Nordic Cloud Systems');

INSERT INTO crm_companies (company_name, country, industry, business_type, domain, lifecycle_stage, account_status)
SELECT 'Dublin FinTech Ltd', 'IE', 'Financial Services', 'SMB', 'dublinfintech.ie', 'Customer', 'active'
WHERE NOT EXISTS (SELECT 1 FROM crm_companies WHERE company_name = 'Dublin FinTech Ltd');

INSERT INTO crm_prospects (prospect_name, prospect_type, company_name, email, country, industry, status, lead_source_id)
SELECT 'Helix Manufacturing', 'Organization', 'Helix Manufacturing', 'sales@helix.ie', 'IE', 'Manufacturing', 'Qualified', ls.lead_source_id
FROM crm_lead_sources ls
WHERE ls.source_name = 'LinkedIn Outbound'
  AND NOT EXISTS (SELECT 1 FROM crm_prospects WHERE prospect_name = 'Helix Manufacturing');

INSERT INTO crm_contacts (company_id, first_name, last_name, full_name, title, email, decision_role, relationship_strength_score)
SELECT c.company_id, 'James', 'Walsh', 'James Walsh', 'CEO', 'j.walsh@dublinfintech.ie', 'Decision Maker', 72
FROM crm_companies c
WHERE c.company_name = 'Dublin FinTech Ltd'
  AND NOT EXISTS (SELECT 1 FROM crm_contacts WHERE email = 'j.walsh@dublinfintech.ie');

INSERT INTO crm_pipeline (opportunity_name, primary_company_id, contract_phase, expected_contract_value, expected_annual_revenue, probability, forecast_close_date)
SELECT 'Dublin FinTech — Annual Platform', c.company_id, 'Negotiation', 180000, 90000, 55, CURRENT_DATE + INTERVAL '30 days'
FROM crm_companies c
WHERE c.company_name = 'Dublin FinTech Ltd'
  AND NOT EXISTS (SELECT 1 FROM crm_pipeline WHERE opportunity_name = 'Dublin FinTech — Annual Platform');

INSERT INTO crm_pipeline (opportunity_name, primary_company_id, contract_phase, expected_contract_value, expected_annual_revenue, probability, forecast_close_date)
SELECT 'Nordic Cloud — Pilot', c.company_id, 'Discovery', 95000, 45000, 35, CURRENT_DATE + INTERVAL '60 days'
FROM crm_companies c
WHERE c.company_name = 'Nordic Cloud Systems'
  AND NOT EXISTS (SELECT 1 FROM crm_pipeline WHERE opportunity_name = 'Nordic Cloud — Pilot');

INSERT INTO crm_revenue_recognition (company_id, revenue_type, gross_revenue, net_revenue, recognition_status, cash_collected_boolean)
SELECT c.company_id, 'Subscription', 120000, 108000, 'Recognized', true
FROM crm_companies c
WHERE c.company_name = 'Acme Telecom Group'
  AND NOT EXISTS (SELECT 1 FROM crm_revenue_recognition WHERE company_id = c.company_id AND revenue_type = 'Subscription');

INSERT INTO crm_commission_attribution (company_id, persona_type, commission_role, attribution_percentage, payable_commission_amount, payment_status)
SELECT c.company_id, 'employee', 'Lead', 40, 12000, 'Pending'
FROM crm_companies c
WHERE c.company_name = 'Acme Telecom Group'
  AND NOT EXISTS (SELECT 1 FROM crm_commission_attribution WHERE company_id = c.company_id AND persona_type = 'employee');

INSERT INTO crm_calls (company_id, call_type, call_datetime, duration_minutes, created_by)
SELECT c.company_id, 'Discovery', NOW() - INTERVAL '2 days', 45, (SELECT id FROM auth_users ORDER BY id LIMIT 1)
FROM crm_companies c
WHERE c.company_name = 'Acme Telecom Group'
  AND NOT EXISTS (SELECT 1 FROM crm_calls WHERE company_id = c.company_id LIMIT 1);

INSERT INTO crm_meetings (company_id, meeting_title, meeting_type, meeting_datetime, created_by)
SELECT c.company_id, 'Executive alignment', 'Video', NOW() + INTERVAL '3 days', (SELECT id FROM auth_users ORDER BY id LIMIT 1)
FROM crm_companies c
WHERE c.company_name = 'Dublin FinTech Ltd'
  AND NOT EXISTS (SELECT 1 FROM crm_meetings WHERE company_id = c.company_id LIMIT 1);

INSERT INTO crm_proposals (company_id, proposal_name, proposal_type, status, shared_datetime, created_by)
SELECT c.company_id, 'Keyra CRM Enterprise Proposal', 'Commercial', 'Shared', NOW() - INTERVAL '5 days', (SELECT id FROM auth_users ORDER BY id LIMIT 1)
FROM crm_companies c
WHERE c.company_name = 'Acme Telecom Group'
  AND NOT EXISTS (SELECT 1 FROM crm_proposals WHERE company_id = c.company_id LIMIT 1);

INSERT INTO crm_ai_activity_log (ai_agent_name, activity_type, output_summary, human_approved_boolean)
SELECT 'Keyra Scout', 'prospect_enrichment', 'Enriched Nordic Cloud Systems profile', true
WHERE NOT EXISTS (SELECT 1 FROM crm_ai_activity_log WHERE ai_agent_name = 'Keyra Scout' LIMIT 1);

INSERT INTO crm_ai_activity_log (ai_agent_name, activity_type, output_summary, human_approved_boolean)
SELECT 'Keyra Outreach', 'email_draft', 'Drafted follow-up for Acme Telecom', false
WHERE NOT EXISTS (SELECT 1 FROM crm_ai_activity_log WHERE ai_agent_name = 'Keyra Outreach' LIMIT 1);
