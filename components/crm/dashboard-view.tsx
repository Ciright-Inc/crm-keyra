"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { chartColors, uiColors } from "@/lib/ui-colors";

type Metrics = {
  totals: Record<string, number>;
  pipelineByPhase: { phase: string; count: string; value: string }[];
  revenueForecast: { status: string; total: string }[];
  commissionForecast: { persona_type: string; total: string }[];
  leadSourcePerformance: { source_name: string; prospects: string }[];
  companiesByCountry: { country: string; count: string }[];
  companiesByIndustry: { industry: string; count: string }[];
  aiActivitySummary: { agent: string; count: string }[];
  conversionFunnel: { stage: string; count: string }[];
};

const axisTick = { fontSize: 11, fill: uiColors.muted };
const gridStroke = uiColors.hairline;

export function DashboardView() {
  const [data, setData] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((j) => j.ok && setData(j.data));
  }, []);

  if (!data) {
    return (
      <div className="crm-empty-state" role="status">
        Loading dashboard…
      </div>
    );
  }

  const stats = [
    { label: "Total Prospects", value: data.totals.prospects },
    { label: "New (30d)", value: data.totals.newProspects30d },
    { label: "Companies", value: data.totals.companies },
    { label: "Contacts", value: data.totals.contacts },
    { label: "Open Follow-ups", value: data.totals.openFollowUps },
    { label: "Overdue", value: data.totals.overdueFollowUps, warn: true },
    { label: "Upcoming Calls", value: data.totals.upcomingCalls },
    { label: "Upcoming Meetings", value: data.totals.upcomingMeetings },
    { label: "Active Proposals", value: data.totals.activeProposals },
  ];

  const pipelineChart = data.pipelineByPhase.map((p) => ({
    name: p.phase,
    count: Number(p.count),
    value: Number(p.value),
  }));

  const funnelChart = data.conversionFunnel.map((f) => ({
    name: f.stage,
    value: Number(f.count),
  }));

  return (
    <div>
      <div className="crm-grid crm-grid-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="crm-card">
            <div className="crm-stat-label">{s.label}</div>
            <div
              className={`crm-stat-value ds-numeric${s.warn && s.value > 0 ? " is-warn" : ""}`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="crm-grid crm-grid-2 mb-6">
        <div className="crm-card">
          <h3 className="crm-card-title">Pipeline by Phase</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineChart}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={axisTick} />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${uiColors.hairlineStrong}`,
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="count" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="crm-card">
          <h3 className="crm-card-title">Contract Value by Phase</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineChart}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={axisTick} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{
                  border: `1px solid ${uiColors.hairlineStrong}`,
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="value" fill={chartColors.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="crm-grid crm-grid-3 mb-6">
        <div className="crm-card">
          <h3 className="crm-card-title">Lead Source Performance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              layout="vertical"
              data={data.leadSourcePerformance.map((l) => ({
                name: l.source_name?.slice(0, 20),
                prospects: Number(l.prospects),
              }))}
            >
              <CartesianGrid stroke={gridStroke} strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" tick={axisTick} />
              <YAxis type="category" dataKey="name" width={100} tick={axisTick} />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${uiColors.hairlineStrong}`,
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              />
              <Bar dataKey="prospects" fill={chartColors.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="crm-card">
          <h3 className="crm-card-title">Companies by Country</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data.companiesByCountry.map((c) => ({
                  name: c.country,
                  value: Number(c.count),
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                stroke={uiColors.hairlineStrong}
              >
                {data.companiesByCountry.map((_, i) => (
                  <Cell key={i} fill={chartColors.series[i % chartColors.series.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  border: `1px solid ${uiColors.hairlineStrong}`,
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="crm-card">
          <h3 className="crm-card-title">Commission Forecast</h3>
          <ul className="space-y-2 text-sm">
            {data.commissionForecast.map((c) => (
              <li key={c.persona_type} className="flex justify-between gap-4">
                <span className="crm-body-text">{c.persona_type}</span>
                <span className="font-medium ds-numeric">{formatCurrency(c.total)}</span>
              </li>
            ))}
            {!data.commissionForecast.length && (
              <li className="crm-muted-text">No commission records</li>
            )}
          </ul>
        </div>
      </div>

      <div className="crm-card mb-6">
        <h3 className="crm-card-title">Conversion Funnel</h3>
        <ResponsiveContainer width="100%" height={280}>
          <FunnelChart>
            <Tooltip
              contentStyle={{
                border: `1px solid ${uiColors.hairlineStrong}`,
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              }}
            />
            <Funnel dataKey="value" data={funnelChart} isAnimationActive fill={chartColors.primary}>
              <LabelList position="right" fill={uiColors.ink} stroke="none" dataKey="name" fontSize={13} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      <div className="crm-grid crm-grid-2">
        <div className="crm-card">
          <h3 className="crm-card-title">Revenue by Status</h3>
          <ul className="space-y-2 text-sm">
            {data.revenueForecast.map((r) => (
              <li key={r.status} className="flex justify-between gap-4">
                <span>{r.status}</span>
                <span className="font-medium ds-numeric">{formatCurrency(r.total)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="crm-card">
          <h3 className="crm-card-title">AI Outbound (30d)</h3>
          <ul className="space-y-2 text-sm">
            {data.aiActivitySummary.map((a) => (
              <li key={a.agent} className="flex justify-between gap-4">
                <span>{a.agent}</span>
                <span className="ds-numeric">{a.count} actions</span>
              </li>
            ))}
            {!data.aiActivitySummary.length && (
              <li className="crm-muted-text">No AI activity logged</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
