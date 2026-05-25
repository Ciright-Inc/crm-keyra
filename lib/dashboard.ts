import { query } from "./db";

export type DashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
  country?: string;
  industry?: string;
  leadSourceId?: string;
  pipelinePhase?: string;
};

export async function getDashboardMetrics(filters: DashboardFilters = {}) {
  const dateClause = filters.dateFrom
    ? `AND date_created >= $1::timestamptz`
    : "";
  const params: unknown[] = filters.dateFrom ? [filters.dateFrom] : [];

  const [
    prospects,
    companies,
    contacts,
    openFollowUps,
    overdueFollowUps,
    upcomingCalls,
    upcomingMeetings,
    activeProposals,
    pipelineByPhase,
    revenueForecast,
    commissionForecast,
    leadSourcePerf,
    companiesByCountry,
    companiesByIndustry,
    aiActivity,
    conversionFunnel,
  ] = await Promise.all([
    query<{ total: string; new_range: string }>(
      `SELECT COUNT(*)::text AS total,
        COUNT(*) FILTER (WHERE date_created >= NOW() - INTERVAL '30 days')::text AS new_range
       FROM crm_prospects WHERE status NOT IN ('Archived', 'Disqualified')`
    ),
    query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM crm_companies`),
    query<{ total: string }>(`SELECT COUNT(*)::text AS total FROM crm_contacts`),
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM crm_follow_ups WHERE status = 'Open'`
    ),
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM crm_follow_ups
       WHERE status = 'Open' AND due_date < CURRENT_DATE`
    ),
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM crm_calls
       WHERE call_datetime >= NOW() AND call_datetime <= NOW() + INTERVAL '7 days'`
    ),
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM crm_meetings
       WHERE meeting_datetime >= NOW() AND meeting_datetime <= NOW() + INTERVAL '7 days'`
    ),
    query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM crm_proposals WHERE status IN ('Shared', 'Viewed', 'Under Review')`
    ),
    query<{ phase: string; count: string; value: string }>(
      `SELECT contract_phase AS phase, COUNT(*)::text AS count,
        COALESCE(SUM(expected_contract_value), 0)::text AS value
       FROM crm_pipeline GROUP BY contract_phase ORDER BY COUNT(*) DESC`
    ),
    query<{ status: string; total: string }>(
      `SELECT recognition_status AS status, COALESCE(SUM(net_revenue), 0)::text AS total
       FROM crm_revenue_recognition GROUP BY recognition_status`
    ),
    query<{ persona_type: string; total: string }>(
      `SELECT persona_type, COALESCE(SUM(payable_commission_amount), 0)::text AS total
       FROM crm_commission_attribution GROUP BY persona_type`
    ),
    query<{ source_name: string; prospects: string }>(
      `SELECT ls.source_name, COUNT(p.prospect_id)::text AS prospects
       FROM crm_lead_sources ls
       LEFT JOIN crm_prospects p ON p.lead_source_id = ls.lead_source_id
       GROUP BY ls.source_name ORDER BY COUNT(p.prospect_id) DESC LIMIT 10`
    ),
    query<{ country: string; count: string }>(
      `SELECT COALESCE(country, 'Unknown') AS country, COUNT(*)::text AS count
       FROM crm_companies GROUP BY country ORDER BY COUNT(*) DESC LIMIT 12`
    ),
    query<{ industry: string; count: string }>(
      `SELECT COALESCE(industry, 'Unknown') AS industry, COUNT(*)::text AS count
       FROM crm_companies GROUP BY industry ORDER BY COUNT(*) DESC LIMIT 12`
    ),
    query<{ agent: string; count: string }>(
      `SELECT ai_agent_name AS agent, COUNT(*)::text AS count
       FROM crm_ai_activity_log
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY ai_agent_name ORDER BY COUNT(*) DESC LIMIT 8`
    ),
    query<{ stage: string; count: string }>(
      `SELECT stage, count::text FROM (
        SELECT 'Lead Sources' AS stage, COUNT(*) AS count FROM crm_lead_sources
        UNION ALL SELECT 'Prospects', COUNT(*) FROM crm_prospects
        UNION ALL SELECT 'Companies', COUNT(*) FROM crm_companies
        UNION ALL SELECT 'Contacts', COUNT(*) FROM crm_contacts
        UNION ALL SELECT 'Proposals', COUNT(*) FROM crm_proposals
        UNION ALL SELECT 'Pipeline', COUNT(*) FROM crm_pipeline
        UNION ALL SELECT 'Revenue Events', COUNT(*) FROM crm_revenue_recognition
        UNION ALL SELECT 'Cash Collected', COUNT(*) FROM crm_revenue_recognition WHERE cash_collected_boolean = true
      ) funnel`
    ),
  ]);

  return {
    totals: {
      prospects: Number(prospects.rows[0]?.total ?? 0),
      newProspects30d: Number(prospects.rows[0]?.new_range ?? 0),
      companies: Number(companies.rows[0]?.total ?? 0),
      contacts: Number(contacts.rows[0]?.total ?? 0),
      openFollowUps: Number(openFollowUps.rows[0]?.total ?? 0),
      overdueFollowUps: Number(overdueFollowUps.rows[0]?.total ?? 0),
      upcomingCalls: Number(upcomingCalls.rows[0]?.total ?? 0),
      upcomingMeetings: Number(upcomingMeetings.rows[0]?.total ?? 0),
      activeProposals: Number(activeProposals.rows[0]?.total ?? 0),
    },
    pipelineByPhase: pipelineByPhase.rows,
    revenueForecast: revenueForecast.rows,
    commissionForecast: commissionForecast.rows,
    leadSourcePerformance: leadSourcePerf.rows,
    companiesByCountry: companiesByCountry.rows,
    companiesByIndustry: companiesByIndustry.rows,
    aiActivitySummary: aiActivity.rows,
    conversionFunnel: conversionFunnel.rows,
    filters,
  };
}

export async function globalSearch(q: string) {
  const term = `%${q.trim()}%`;
  if (!q.trim()) return { results: [] };

  const [companies, contacts, prospects, pipeline] = await Promise.all([
    query(
      `SELECT company_id AS id, company_name AS title, 'company' AS type
       FROM crm_companies WHERE company_name ILIKE $1 LIMIT 10`,
      [term]
    ),
    query(
      `SELECT contact_id AS id, COALESCE(full_name, first_name || ' ' || last_name) AS title, 'contact' AS type
       FROM crm_contacts WHERE full_name ILIKE $1 OR email ILIKE $1 LIMIT 10`,
      [term]
    ),
    query(
      `SELECT prospect_id AS id, prospect_name AS title, 'prospect' AS type
       FROM crm_prospects WHERE prospect_name ILIKE $1 OR company_name ILIKE $1 LIMIT 10`,
      [term]
    ),
    query(
      `SELECT pipeline_id AS id, opportunity_name AS title, 'pipeline' AS type
       FROM crm_pipeline WHERE opportunity_name ILIKE $1 LIMIT 10`,
      [term]
    ),
  ]);

  return {
    results: [
      ...companies.rows,
      ...contacts.rows,
      ...prospects.rows,
      ...pipeline.rows,
    ],
  };
}
