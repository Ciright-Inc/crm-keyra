import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api";

export async function GET() {
  try {
    const [roles, phases, sourceTypes, countries, industries, sync, audit] =
      await Promise.all([
        query(`SELECT * FROM crm_roles ORDER BY id`),
        query(`SELECT * FROM crm_pipeline_phases ORDER BY sort_order`),
        query(`SELECT * FROM crm_lead_source_types ORDER BY name`),
        query(`SELECT * FROM crm_countries ORDER BY name`),
        query(`SELECT * FROM crm_industries ORDER BY name`),
        query(`SELECT * FROM crm_admin_settings WHERE key = 'ciright_core_sync'`),
        query(
          `SELECT * FROM crm_audit_log ORDER BY created_at DESC LIMIT 50`
        ),
      ]);

    return jsonOk({
      roles: roles.rows,
      pipelinePhases: phases.rows,
      leadSourceTypes: sourceTypes.rows,
      countries: countries.rows,
      industries: industries.rows,
      cirightSync: sync.rows[0]?.value ?? {},
      recentAudit: audit.rows,
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Admin error");
  }
}
