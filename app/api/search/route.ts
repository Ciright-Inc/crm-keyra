import { globalSearch } from "@/lib/dashboard";
import { jsonOk, jsonError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams.get("q") ?? "";
    const results = await globalSearch(q);
    return jsonOk(results);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Search error");
  }
}
