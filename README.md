# Keyra Enterprise CRM — crm.keyra.ie

Enterprise relationship intelligence layer for Keyra, connected to Ciright Core and Keyra persona architecture.

## Stack

- **Next.js 16** (App Router)
- **PostgreSQL** (`keyra-auth` database, `crm_*` tables)
- **Keyra auth** (`auth_users`, affiliates, developers)

## Quick start

```bash
cd crm-keyra
npm install
cp .env.local.example .env.local   # or use existing .env.local
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/dashboard`.

## Database

Default connection (`.env.local`):

```
DATABASE_URL=postgresql://postgres:ciright@192.168.1.206:5432/keyra-auth
```

Migrations live in `db/migrations/`. Seed includes demo company **Acme Telecom Group**, prospect, pipeline, and follow-up.

## Personas

| Type | Access |
|------|--------|
| Employee | Full CRM + admin |
| Affiliate / Developer / Authorized Rep | Scoped modules per `crm_roles` |

## Documentation

- [RFP Traceability Matrix](docs/RFP_TRACEABILITY.md) — requirement → schema → route mapping

## Production auth

Set `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS=false` and wire Keyra SAT session to `/api/health` or dedicated session endpoint.
