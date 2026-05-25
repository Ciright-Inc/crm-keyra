import { getCompany360 } from "@/lib/company-360";
import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getCompany360(id);
    if (!data) return jsonError("Company not found", 404);
    return jsonOk(data);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Error");
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = [
      "company_name", "country", "industry", "lifecycle_stage",
      "account_status", "ai_relationship_summary", "notes",
    ];
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;
    for (const key of allowed) {
      if (body[key] !== undefined) {
        sets.push(`${key} = $${i++}`);
        values.push(body[key]);
      }
    }
    if (!sets.length) return jsonError("No fields to update", 400);
    sets.push(`updated_at = NOW()`);
    values.push(id);
    await query(
      `UPDATE crm_companies SET ${sets.join(", ")} WHERE company_id = $${i}`,
      values
    );
    const data = await getCompany360(id);
    return jsonOk(data);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Update failed");
  }
}
