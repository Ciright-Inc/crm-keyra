import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api";

export async function GET() {
  try {
    const [today, week, overdue, byCompany] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS count FROM crm_follow_ups
         WHERE status = 'Open' AND due_date = CURRENT_DATE`
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM crm_follow_ups
         WHERE status = 'Open' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7`
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM crm_follow_ups
         WHERE status IN ('Open', 'Overdue') AND due_date < CURRENT_DATE`
      ),
      query(
        `SELECT c.company_name, COUNT(f.follow_up_id)::int AS count
         FROM crm_follow_ups f
         JOIN crm_companies c ON c.company_id = f.company_id
         WHERE f.status = 'Open'
         GROUP BY c.company_name ORDER BY count DESC LIMIT 10`
      ),
    ]);

    return jsonOk({
      today: today.rows[0]?.count ?? 0,
      thisWeek: week.rows[0]?.count ?? 0,
      overdue: overdue.rows[0]?.count ?? 0,
      byCompany: byCompany.rows,
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Error");
  }
}
