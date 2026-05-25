"use client";

type Contact = Record<string, unknown>;

export function RelationshipMap({
  companyName,
  contacts,
}: {
  companyName: string;
  contacts: Contact[];
}) {
  return (
    <div className="crm-card">
      <h3 className="crm-card-title">Relationship Map</h3>
      <div className="crm-rel-map">
        <div className="crm-rel-node center">{companyName}</div>
        {contacts.slice(0, 6).map((ct) => (
          <div key={String(ct.contact_id)} className="crm-rel-node">
            <div className="font-medium text-sm">
              {String(ct.full_name ?? `${ct.first_name} ${ct.last_name}`)}
            </div>
            <div className="crm-muted-text text-xs mt-1">{String(ct.title ?? "—")}</div>
            <div className="text-xs mt-2">
              <span className="crm-badge">{String(ct.decision_role)}</span>
            </div>
            <div className="crm-muted-text text-xs mt-1 ds-numeric">
              Influence: {String(ct.relationship_strength_score ?? 0)}
            </div>
          </div>
        ))}
      </div>
      <p className="crm-helper-text mt-3">
        Keyra owners: Lead / Support / Management assignment from company & contact records.
      </p>
    </div>
  );
}
