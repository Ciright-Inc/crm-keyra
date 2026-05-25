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

Migrations live in `db/migrations/`:

| File | What it does |
|------|----------------|
| `001_initial_schema.sql` | Creates **all** `crm_*` tables (40+ tables) |
| `002_seed_data.sql` | Seeds roles, phases, countries, demo **Acme Telecom Group**, prospect, pipeline, follow-up |

Run once per database: `npm run db:migrate`

Check data after migrate: open `/api/db-status` (JSON with row counts per table).

## Personas

| Type | Access |
|------|--------|
| Employee | Full CRM + admin |
| Affiliate / Developer / Authorized Rep | Scoped modules per `crm_roles` |

## Documentation

- [RFP Traceability Matrix](docs/RFP_TRACEABILITY.md) — requirement → schema → route mapping

## Production auth

Set `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS=false` and wire Keyra SAT session to `/api/health` or dedicated session endpoint.

## Deploy on Railway

If the app stays on **“Verifying Keyra session…”** (or shows **CRM unavailable**), the deploy cannot reach Postgres or auth bypass was not baked into the build.

### Required variables (Railway → Variables)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Postgres URL **reachable from Railway** (use Railway Postgres plugin or public RDS — not `192.168.x` LAN) |
| `PGSSLMODE` | `require` for most cloud databases |
| `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS` | `true` for demo without Keyra login; `false` when DB + real auth are ready |

**Important:** `NEXT_PUBLIC_*` variables are embedded at **`npm run build`**. After changing them in Railway, trigger a **new deploy / rebuild**, not only a restart.

### Recommended start command

```bash
npm run db:migrate && npm run start
```

Or run migrations once manually, then `npm run start`.

### Quick fix (show the dashboard)

1. Set `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS=true`
2. Set a valid cloud `DATABASE_URL` (or bypass still shows UI but API pages need DB)
3. Redeploy (full build)
