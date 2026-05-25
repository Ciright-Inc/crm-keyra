"use client";

import { CRM_ENTITIES } from "@/lib/entities";
import { EntityList } from "./entity-list";

export function EntityPage({ entityKey }: { entityKey: string }) {
  const config = CRM_ENTITIES[entityKey];
  if (!config) return <p>Unknown module</p>;

  return (
    <>
      <h1 className="crm-page-title">{config.label}</h1>
      <p className="crm-page-sub">
        Enterprise system of record · Traceable to lead source, contract, revenue & commission
      </p>
      <EntityList entityKey={entityKey} config={config} />
    </>
  );
}
