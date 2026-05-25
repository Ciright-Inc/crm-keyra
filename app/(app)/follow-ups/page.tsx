"use client";

import { useEffect, useState } from "react";
import { EntityPage } from "@/components/crm/entity-page";

type Summary = {
  today: number;
  thisWeek: number;
  overdue: number;
  byCompany: { company_name: string; count: number }[];
};

export default function FollowUpsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/follow-ups/summary")
      .then((r) => r.json())
      .then((j) => j.ok && setSummary(j.data));
  }, []);

  return (
    <>
      <h1 className="crm-page-title">Follow-Up</h1>
      <p className="crm-page-sub">Action-triggered tasks — today, this week, overdue, by company</p>
      {summary && (
        <div className="crm-grid crm-grid-4 mb-6">
          <div className="crm-card">
            <div className="crm-stat-label">Today</div>
            <div className="crm-stat-value">{summary.today}</div>
          </div>
          <div className="crm-card">
            <div className="crm-stat-label">This Week</div>
            <div className="crm-stat-value">{summary.thisWeek}</div>
          </div>
          <div className="crm-card">
            <div className="crm-stat-label">Overdue</div>
            <div className="crm-stat-value" style={{ color: "var(--crm-error)" }}>
              {summary.overdue}
            </div>
          </div>
          <div className="crm-card">
            <div className="crm-stat-label">By Company (top)</div>
            <ul className="text-sm mt-2 space-y-1">
              {summary.byCompany.map((b) => (
                <li key={b.company_name} className="flex justify-between">
                  <span>{b.company_name}</span>
                  <span>{b.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <EntityPage entityKey="follow_ups" />
    </>
  );
}
