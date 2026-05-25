import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api";

const COUNT_TABLES = [
  "crm_roles",
  "crm_lead_sources",
  "crm_prospects",
  "crm_companies",
  "crm_contacts",
  "crm_pipeline",
  "crm_follow_ups",
  "crm_revenue_recognition",
  "crm_commission_attribution",
] as const;

export async function GET() {
  try {
    await query("SELECT 1");
    const counts: Record<string, number> = {};
    for (const table of COUNT_TABLES) {
      const r = await query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM ${table}`);
      counts[table] = Number(r.rows[0]?.c ?? 0);
    }
    const migrations = await query<{ name: string }>(
      `SELECT name FROM crm_schema_migrations ORDER BY name`
    ).catch(() => ({ rows: [] as { name: string }[] }));

    return jsonOk({
      connected: true,
      migrations: migrations.rows.map((r) => r.name),
      counts,
      hint:
        counts.crm_companies === 0
          ? "Tables exist but seed data may be missing — run npm run db:migrate on this database."
          : undefined,
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Database unavailable", 503);
  }
}
