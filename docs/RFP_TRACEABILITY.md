# crm.keyra.ie — RFP Traceability Matrix

Deliverable mapping, compliance logic, and requirement traceability for Keyra Enterprise CRM.

## Application Identity

| Field | Value |
|-------|-------|
| Application | crm.keyra.ie |
| Database | keyra-auth (PostgreSQL) |
| Table prefix | `crm_*` |
| Auth integration | `auth_users`, `affiliate_accounts`, `developer_accounts` |

## Persona Coverage

| Persona | Role seed | Permissions scope |
|---------|-----------|-------------------|
| Employee Type 1 | `crm_employee`, `crm_super_admin` | Full internal modules |
| Affiliate | `crm_affiliate` | Prospects through commission (no admin/revenue rules) |
| Developer | `crm_developer` | Same as affiliate |
| Authorized Rep | `crm_authorized_rep` | Same as affiliate |

## Navigation → Deliverable Map

| # | Nav Tab | Schema Table(s) | UI Route | API |
|---|---------|-----------------|----------|-----|
| 1 | Dashboard | Aggregates all `crm_*` | `/dashboard` | `GET /api/dashboard` |
| 2 | Lead Source | `crm_lead_sources` | `/lead-sources` | `GET /api/entities/lead_sources` |
| 3 | Prospects | `crm_prospects` | `/prospects` | `GET /api/entities/prospects` |
| 4 | Companies | `crm_companies` | `/companies`, `/companies/[id]` | `GET /api/entities/companies`, `GET /api/companies/[id]` |
| 5 | Contacts | `crm_contacts` | `/contacts` | `GET /api/entities/contacts` |
| 6 | Calls | `crm_calls`, `crm_call_*` | `/calls` | `GET /api/entities/calls` |
| 7 | Emails / Comms | `crm_communications` | `/communications` | `GET /api/entities/communications` |
| 8 | Meetings | `crm_meetings`, `crm_meeting_*` | `/meetings` | `GET /api/entities/meetings` |
| 9 | Proposals | `crm_proposals`, `crm_proposal_*` | `/proposals` | `GET /api/entities/proposals` |
| 10 | Follow-Up | `crm_follow_ups` | `/follow-ups` | `GET /api/entities/follow_ups`, `GET /api/follow-ups/summary` |
| 11 | Pipeline | `crm_pipeline`, `crm_contract_players`, joins | `/pipeline` | `GET /api/entities/pipeline` |
| 12 | Revenue | `crm_revenue_recognition` | `/revenue` | `GET /api/entities/revenue` |
| 13 | Commission | `crm_commission_attribution` | `/commission` | `GET /api/entities/commission` |
| 14 | Files | `crm_files`, `crm_entity_files` | `/files` | `GET /api/entities/files` |
| 15 | AI Activity | `crm_ai_activity_log` | `/ai-activity` | `GET /api/entities/ai_log` |
| 16 | Admin | `crm_roles`, settings, audit | `/admin` | `GET /api/admin` |

## End-to-End Traceability Chain

```
Lead Source (crm_lead_sources)
  → Prospect (crm_prospects.lead_source_id)
  → Company (crm_companies.lead_source_id)
  → Contact (crm_contacts.company_id)
  → Activities (calls, communications, meetings, proposals)
  → Follow-up (crm_follow_ups)
  → Pipeline (crm_pipeline.lead_source_id)
  → Revenue (crm_revenue_recognition.pipeline_id)
  → Commission (crm_commission_attribution.lead_source_id, revenue_id, pipeline_id)
  → Cash collected (revenue.cash_collected_boolean gates commission payment_status)
```

## Compliance & Security Controls

| Control | Implementation |
|---------|----------------|
| RBAC | `crm_roles`, `crm_user_access`, persona-linked permissions JSON |
| Row visibility | `visibility` column on entities; `crm_v_user_context` view |
| Audit | `crm_audit_log` + Admin recent audit panel |
| AI approval | `crm_ai_activity_log.human_approved_boolean`, `approved_by_user_id` |
| Commission rule | Admin `commission_rules.payable_after_cash_collected` |
| Internal-only | No public routes; dev bypass flag for local |
| FK integrity | UUID PKs, explicit FKs to companies, contacts, pipeline, revenue |

## Standard Entity Fields (all core tables)

- `created_by` / `updated_by` → `auth_users.id`
- Timestamps: `date_created`, `created_at`, `updated_at`
- `status` where applicable
- `visibility` for persona scoping
- Lead source attribution via FK or `source_attribution` JSONB

## QA Checklist

- [ ] `npm run db:migrate` succeeds on keyra-auth
- [ ] `GET /api/health` returns healthy
- [ ] Dashboard loads all widget sections
- [ ] Company 360 shows contacts, timeline, pipeline, revenue, commission tabs
- [ ] Global search returns companies, contacts, prospects, pipeline
- [ ] Follow-up summary shows today / week / overdue
- [ ] Admin shows roles, phases, Ciright sync status
- [ ] Seed data: Acme Telecom, Nordic Cloud prospect, sample pipeline
