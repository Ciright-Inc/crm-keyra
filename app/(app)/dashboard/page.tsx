import { DashboardView } from "@/components/crm/dashboard-view";

export default function DashboardPage() {
  return (
    <>
      <h1 className="crm-page-title">Executive Dashboard</h1>
      <p className="crm-page-sub">
        Aggregated CRM intelligence — prospects, pipeline, revenue, commission, AI outbound
      </p>
      <DashboardView />
    </>
  );
}
