import { query } from "./db";

export async function logAudit(params: {
  authUserId?: number | null;
  personaId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
}) {
  await query(
    `INSERT INTO crm_audit_log (auth_user_id, persona_id, action, entity_type, entity_id, old_values, new_values, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      params.authUserId ?? null,
      params.personaId ?? null,
      params.action,
      params.entityType ?? null,
      params.entityId ?? null,
      params.oldValues ? JSON.stringify(params.oldValues) : null,
      params.newValues ? JSON.stringify(params.newValues) : null,
      params.ipAddress ?? null,
    ]
  );
}
