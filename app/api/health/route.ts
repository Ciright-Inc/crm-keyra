import { query } from "@/lib/db";
import { jsonOk, jsonError } from "@/lib/api";

export async function GET() {
  try {
    await query("SELECT 1");
    return jsonOk({ status: "healthy", service: "crm.keyra.ie" });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Database unavailable", 503);
  }
}
