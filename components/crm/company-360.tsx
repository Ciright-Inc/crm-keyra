"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { RelationshipMap } from "./relationship-map";
import { ApiErrorPanel } from "./api-error-panel";

type Company360Data = {
  company: Record<string, unknown>;
  contacts: Record<string, unknown>[];
  calls: Record<string, unknown>[];
  communications: Record<string, unknown>[];
  meetings: Record<string, unknown>[];
  proposals: Record<string, unknown>[];
  followUps: Record<string, unknown>[];
  pipeline: Record<string, unknown>[];
  revenue: Record<string, unknown>[];
  commissions: Record<string, unknown>[];
  timeline: Record<string, unknown>[];
  comments: Record<string, unknown>[];
  files: Record<string, unknown>[];
};

const TABS = [
  "Overview",
  "Contacts",
  "Timeline",
  "Calls",
  "Communications",
  "Meetings",
  "Proposals",
  "Follow-ups",
  "Pipeline",
  "Revenue",
  "Commission",
  "Files",
] as const;

export function Company360({ companyId }: { companyId: string }) {
  const [data, setData] = useState<Company360Data | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/companies/${companyId}`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j.error ?? `Failed to load company (${r.status})`);
        setData(j.data);
      })
      .catch((e) => {
        setData(null);
        setError(e instanceof Error ? e.message : "Request failed");
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="crm-empty-state" role="status">
        Loading company intelligence…
      </p>
    );
  }

  if (error || !data) {
    return (
      <ApiErrorPanel
        title="Could not load company"
        message={error ?? "No data returned"}
        onRetry={load}
      />
    );
  }

  const c = data.company;

  return (
    <div>
      <div className="mb-6">
        <Link href="/companies" className="ds-text-link text-sm">
          ← Companies
        </Link>
        <h1 className="crm-page-title mt-2">{String(c.company_name)}</h1>
        <p className="crm-page-sub">
          {[c.country, c.industry, c.lifecycle_stage].filter(Boolean).join(" · ")}
          {c.source_name ? ` · Lead: ${c.source_name}` : ""}
        </p>
      </div>

      <div className="crm-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={`crm-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="crm-grid crm-grid-2">
          <div className="crm-card">
            <h3 className="crm-card-title">Profile</h3>
            <table className="crm-trace-table w-full">
              <tbody>
                <tr>
                  <td>Domain</td>
                  <td>{String(c.domain ?? "—")}</td>
                </tr>
                <tr>
                  <td>Website</td>
                  <td>{String(c.primary_website ?? "—")}</td>
                </tr>
                <tr>
                  <td>Owner Type</td>
                  <td>{String(c.customer_owner_type ?? "—")}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>{String(c.account_status ?? "—")}</td>
                </tr>
                <tr>
                  <td>Ciright Core ID</td>
                  <td className="ds-numeric">{String(c.ciright_core_company_id ?? "—")}</td>
                </tr>
              </tbody>
            </table>
            {c.ai_relationship_summary != null && String(c.ai_relationship_summary) !== "" ? (
              <div className="crm-ai-summary">
                <strong>AI Summary</strong>
                <p className="mt-1 crm-body-text">{String(c.ai_relationship_summary)}</p>
              </div>
            ) : null}
          </div>
          <RelationshipMap companyName={String(c.company_name)} contacts={data.contacts} />
        </div>
      )}

      {tab === "Contacts" && (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Role</th>
                <th className="crm-table-numeric">Score</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.contacts.map((ct) => (
                <tr key={String(ct.contact_id)}>
                  <td>{String(ct.full_name ?? `${ct.first_name} ${ct.last_name}`)}</td>
                  <td>{String(ct.title ?? "—")}</td>
                  <td>
                    <span className="crm-badge">{String(ct.decision_role)}</span>
                  </td>
                  <td className="crm-table-numeric">
                    {String(ct.relationship_strength_score)}
                  </td>
                  <td>{String(ct.email ?? "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Timeline" && (
        <div className="crm-card">
          {[
            ...data.calls.map((x) => ({
              type: "Call",
              at: x.call_datetime,
              title: x.call_type,
              id: x.call_id,
            })),
            ...data.communications.map((x) => ({
              type: "Comm",
              at: x.date_time,
              title: x.subject ?? x.communication_type,
              id: x.communication_id,
            })),
            ...data.meetings.map((x) => ({
              type: "Meeting",
              at: x.meeting_datetime,
              title: x.meeting_title,
              id: x.meeting_id,
            })),
            ...data.proposals.map((x) => ({
              type: "Proposal",
              at: x.shared_datetime ?? x.created_at,
              title: x.proposal_name,
              id: x.proposal_id,
            })),
          ]
            .sort((a, b) => new Date(String(b.at)).getTime() - new Date(String(a.at)).getTime())
            .map((ev) => (
              <div key={String(ev.id)} className="crm-timeline-item">
                <div className="crm-timeline-dot" />
                <div>
                  <div className="ds-caption-uppercase" style={{ fontSize: "11px" }}>
                    {String(ev.type)} · {formatDateTime(String(ev.at))}
                  </div>
                  <div className="font-medium text-sm mt-1">{String(ev.title)}</div>
                </div>
              </div>
            ))}
          {!data.calls.length && !data.communications.length && (
            <p className="crm-muted-text text-sm">No activity yet</p>
          )}
        </div>
      )}

      {tab === "Pipeline" && (
        <div className="crm-card">
          {data.pipeline.map((p) => (
            <div key={String(p.pipeline_id)} className="crm-list-divider">
              <div className="font-medium">{String(p.opportunity_name)}</div>
              <div className="crm-body-text text-sm mt-1">
                {String(p.contract_phase)} · {formatCurrency(p.expected_contract_value as number)} ·{" "}
                <span className="ds-numeric">{String(p.probability)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Revenue" && (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Type</th>
                <th className="crm-table-numeric">Gross</th>
                <th>Status</th>
                <th>Cash</th>
              </tr>
            </thead>
            <tbody>
              {data.revenue.map((r) => (
                <tr key={String(r.revenue_id)}>
                  <td>{String(r.revenue_type ?? "—")}</td>
                  <td className="crm-table-numeric">
                    {formatCurrency(r.gross_revenue as number)}
                  </td>
                  <td>
                    <span className="crm-badge">{String(r.recognition_status)}</span>
                  </td>
                  <td>{r.cash_collected_boolean ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Commission" && (
        <div className="crm-table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Role</th>
                <th className="crm-table-numeric">%</th>
                <th className="crm-table-numeric">Payable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.commissions.map((cm) => (
                <tr key={String(cm.commission_id)}>
                  <td>{String(cm.persona_type)}</td>
                  <td>{String(cm.commission_role ?? "—")}</td>
                  <td className="crm-table-numeric">{String(cm.attribution_percentage)}%</td>
                  <td className="crm-table-numeric">
                    {formatCurrency(cm.payable_commission_amount as number)}
                  </td>
                  <td>{String(cm.payment_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Follow-ups" && (
        <div className="crm-card">
          {data.followUps.map((f) => (
            <div key={String(f.follow_up_id)} className="crm-list-row">
              <span>
                {String(f.follow_up_type)} — {String(f.notes ?? "").slice(0, 60)}
              </span>
              <span className={`crm-badge ${String(f.status).toLowerCase()}`}>
                {formatDate(String(f.due_date))} · {String(f.priority)}
              </span>
            </div>
          ))}
        </div>
      )}

      {["Calls", "Communications", "Meetings", "Proposals", "Files"].includes(tab) && (
        <div className="crm-card crm-body-text text-sm">
          {tab === "Calls" && data.calls.length}
          {tab === "Communications" && data.communications.length}
          {tab === "Meetings" && data.meetings.length}
          {tab === "Proposals" && data.proposals.length}
          {tab === "Files" && data.files.length}{" "}
          records — full CRUD via API aligned to entity schema.
        </div>
      )}
    </div>
  );
}
