"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EntityConfig } from "@/lib/entities";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";

type EntityListProps = {
  entityKey: string;
  config: EntityConfig;
  /** Override detail path prefix, e.g. `/companies` */
  detailBasePath?: string;
};

function formatCell(key: string, value: unknown) {
  if (value == null) return "—";
  if (key.includes("date") || key.includes("datetime") || key.endsWith("_at")) {
    const s = String(value);
    return s.includes("T") || s.includes(":") ? formatDateTime(s) : formatDate(s);
  }
  if (key.includes("value") || key.includes("revenue") || key.includes("commission")) {
    const n = Number(value);
    if (!Number.isNaN(n) && n > 100) return formatCurrency(n);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function isNumericColumn(key: string) {
  return (
    key.includes("value") ||
    key.includes("revenue") ||
    key.includes("commission") ||
    key.includes("amount") ||
    key.includes("score")
  );
}

export function EntityList({ entityKey, config, detailBasePath }: EntityListProps) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (q) params.set("q", q);
    fetch(`/api/entities/${entityKey}?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setItems(j.data.items);
          setTotal(j.data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [entityKey, q]);

  const base = detailBasePath ?? config.href;

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          className="crm-search max-w-xs"
          placeholder={`Filter ${config.label.toLowerCase()}…`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={`Filter ${config.label}`}
        />
        <span className="crm-helper-text self-center">{total} records</span>
      </div>
      <div className="crm-table-wrap overflow-x-auto">
        {loading ? (
          <p className="crm-empty-state" role="status">
            Loading…
          </p>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                {config.listColumns.map((col) => (
                  <th
                    key={col}
                    className={isNumericColumn(col) ? "crm-table-numeric" : undefined}
                  >
                    {col.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const id = String(row[config.idColumn]);
                return (
                  <tr key={id}>
                    {config.listColumns.map((col, i) => (
                      <td
                        key={col}
                        className={isNumericColumn(col) ? "crm-table-numeric" : undefined}
                      >
                        {i === 0 ? (
                          <Link href={`${base}/${id}`}>{formatCell(col, row[col])}</Link>
                        ) : col === "status" ? (
                          <span
                            className={`crm-badge ${String(row[col]).toLowerCase()}`}
                          >
                            {formatCell(col, row[col])}
                          </span>
                        ) : (
                          formatCell(col, row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {!items.length && (
                <tr>
                  <td colSpan={config.listColumns.length} className="crm-empty-state">
                    No records yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
