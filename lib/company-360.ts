import { query } from "./db";

export async function getCompany360(companyId: string) {
  const company = await query(
    `SELECT c.*, ls.source_name, ls.source_type
     FROM crm_companies c
     LEFT JOIN crm_lead_sources ls ON ls.lead_source_id = c.lead_source_id
     WHERE c.company_id = $1`,
    [companyId]
  );
  if (!company.rows[0]) return null;

  const [
    contacts,
    calls,
    communications,
    meetings,
    proposals,
    followUps,
    pipeline,
    revenue,
    commissions,
    timeline,
    comments,
    files,
  ] = await Promise.all([
    query(`SELECT * FROM crm_contacts WHERE company_id = $1 ORDER BY relationship_strength_score DESC`, [companyId]),
    query(`SELECT * FROM crm_calls WHERE company_id = $1 ORDER BY call_datetime DESC LIMIT 20`, [companyId]),
    query(`SELECT * FROM crm_communications WHERE company_id = $1 ORDER BY date_time DESC LIMIT 20`, [companyId]),
    query(`SELECT * FROM crm_meetings WHERE company_id = $1 ORDER BY meeting_datetime DESC LIMIT 20`, [companyId]),
    query(`SELECT * FROM crm_proposals WHERE company_id = $1 ORDER BY created_at DESC LIMIT 20`, [companyId]),
    query(`SELECT * FROM crm_follow_ups WHERE company_id = $1 ORDER BY due_date ASC LIMIT 20`, [companyId]),
    query(
      `SELECT p.* FROM crm_pipeline p
       LEFT JOIN crm_pipeline_companies pc ON pc.pipeline_id = p.pipeline_id
       WHERE p.primary_company_id = $1 OR pc.company_id = $1
       ORDER BY p.date_created DESC`,
      [companyId]
    ),
    query(`SELECT * FROM crm_revenue_recognition WHERE company_id = $1 ORDER BY created_at DESC`, [companyId]),
    query(`SELECT * FROM crm_commission_attribution WHERE company_id = $1 ORDER BY created_at DESC`, [companyId]),
    query(
      `SELECT * FROM crm_timeline_events WHERE company_id = $1 ORDER BY event_at DESC LIMIT 50`,
      [companyId]
    ),
    query(
      `SELECT cm.* FROM crm_comments cm
       JOIN crm_entity_comments ec ON ec.comment_id = cm.comment_id
       WHERE ec.entity_type = 'company' AND ec.entity_id = $1
       ORDER BY cm.created_at DESC`,
      [companyId]
    ),
    query(
      `SELECT f.* FROM crm_files f
       JOIN crm_entity_files ef ON ef.file_id = f.file_id
       WHERE ef.entity_type = 'company' AND ef.entity_id = $1
       ORDER BY f.uploaded_at DESC`,
      [companyId]
    ),
  ]);

  return {
    company: company.rows[0],
    contacts: contacts.rows,
    calls: calls.rows,
    communications: communications.rows,
    meetings: meetings.rows,
    proposals: proposals.rows,
    followUps: followUps.rows,
    pipeline: pipeline.rows,
    revenue: revenue.rows,
    commissions: commissions.rows,
    timeline: timeline.rows,
    comments: comments.rows,
    files: files.rows,
  };
}
