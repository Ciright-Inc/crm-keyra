import { CRM_ENTITIES } from "@/lib/entities";
import { query } from "@/lib/db";
import { jsonOk, jsonError, getPagination } from "@/lib/api";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const { entity } = await params;
    const config = CRM_ENTITIES[entity];
    if (!config) return jsonError("Unknown entity", 404);

    const { searchParams } = new URL(req.url);
    const { limit, offset, page } = getPagination(searchParams);
    const q = searchParams.get("q")?.trim();
    const status = searchParams.get("status");

    let where = "WHERE 1=1";
    const values: unknown[] = [];
    let idx = 1;

    if (q) {
      const searchCol = config.listColumns[0];
      where += ` AND ${searchCol}::text ILIKE $${idx++}`;
      values.push(`%${q}%`);
    }
    if (status && config.table !== "crm_lead_sources") {
      where += ` AND status = $${idx++}`;
      values.push(status);
    }

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${config.table} ${where}`,
      values
    );

    values.push(limit, offset);
    const orderCol = config.listColumns.find((c) =>
      /date|time|created|uploaded|due|shared/i.test(c)
    );
    const orderBy = orderCol ? `${orderCol} DESC NULLS LAST` : `${config.idColumn} DESC`;
    const rows = await query(
      `SELECT * FROM ${config.table} ${where} ORDER BY ${orderBy} LIMIT $${idx++} OFFSET $${idx}`,
      values
    );

    return jsonOk({
      items: rows.rows,
      page,
      limit,
      total: Number(countRes.rows[0]?.count ?? 0),
    });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "List error");
  }
}
