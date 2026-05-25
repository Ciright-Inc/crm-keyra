"use client";

import { useEffect, useState } from "react";

type AdminData = {
  roles: { name: string; persona_type: string }[];
  pipelinePhases: { name: string }[];
  leadSourceTypes: { name: string }[];
  countries: { code: string; name: string }[];
  industries: { name: string }[];
  cirightSync: { status?: string };
  recentAudit: { action: string; entity_type: string; created_at: string }[];
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((j) => j.ok && setData(j.data));
  }, []);

  if (!data) {
    return (
      <p className="crm-empty-state" role="status">
        Loading admin…
      </p>
    );
  }

  return (
    <>
      <h1 className="crm-page-title">Admin / Settings</h1>
      <p className="crm-page-sub">
        Personas, roles, pipeline phases, commission rules, Ciright Core sync, audit logs
      </p>
      <div className="crm-grid crm-grid-2">
        <div className="crm-card">
          <h3 className="crm-card-title">Roles & Personas</h3>
          <ul className="text-sm space-y-1">
            {data.roles.map((r) => (
              <li key={r.name}>
                {r.name} <span className="crm-muted-text">({r.persona_type})</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="crm-card">
          <h3 className="crm-card-title">Ciright Core Sync</h3>
          <p className="text-sm">
            Status: <span className="crm-badge">{data.cirightSync?.status ?? "pending"}</span>
          </p>
          <p className="crm-helper-text mt-2">
            Internal-only sync to auth_users, affiliate_accounts, developer_accounts
          </p>
        </div>
        <div className="crm-card">
          <h3 className="crm-card-title">Pipeline Phases</h3>
          <p className="text-sm crm-body-text">
            {data.pipelinePhases.map((p) => p.name).join(" → ")}
          </p>
        </div>
        <div className="crm-card">
          <h3 className="crm-card-title">Lead Source Types</h3>
          <p className="text-sm">{data.leadSourceTypes.map((t) => t.name).join(", ")}</p>
        </div>
        <div className="crm-card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="crm-card-title">Recent Audit Log</h3>
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAudit.map((a, i) => (
                  <tr key={i}>
                    <td>{a.action}</td>
                    <td>{a.entity_type ?? "—"}</td>
                    <td className="ds-numeric">{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {!data.recentAudit.length && (
                  <tr>
                    <td colSpan={3} className="crm-empty-state">
                      No audit entries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
