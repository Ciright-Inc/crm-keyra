"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [results, setResults] = useState<{ id: string; title: string; type: string }[]>([]);

  useEffect(() => {
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((j) => j.ok && setResults(j.data.results));
  }, [q]);

  const hrefMap: Record<string, string> = {
    company: "/companies",
    contact: "/contacts",
    prospect: "/prospects",
    pipeline: "/pipeline",
  };

  return (
    <div className="crm-card">
      <ul className="space-y-2 text-sm">
        {results.map((r) => (
          <li key={`${r.type}-${r.id}`}>
            <Link href={`${hrefMap[r.type] ?? "/companies"}/${r.id}`} className="ds-text-link font-medium">
              {r.title}
            </Link>
            <span className="ds-caption-uppercase ml-2" style={{ fontSize: "11px" }}>
              {r.type}
            </span>
          </li>
        ))}
        {!results.length && q && <li className="crm-muted-text">No matches</li>}
      </ul>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <h1 className="crm-page-title">Global Search</h1>
      <p className="crm-page-sub">Cross-entity search</p>
      <Suspense fallback={<p className="crm-empty-state">Searching…</p>}>
        <SearchResults />
      </Suspense>
    </>
  );
}
