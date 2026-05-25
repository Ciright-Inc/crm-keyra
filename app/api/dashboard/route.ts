import { getDashboardMetrics } from "@/lib/dashboard";
import { jsonOk, jsonError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const metrics = await getDashboardMetrics({
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      country: searchParams.get("country") ?? undefined,
      industry: searchParams.get("industry") ?? undefined,
      leadSourceId: searchParams.get("leadSourceId") ?? undefined,
      pipelinePhase: searchParams.get("pipelinePhase") ?? undefined,
    });
    return jsonOk(metrics);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Dashboard error");
  }
}
