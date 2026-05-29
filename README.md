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

### Railway URL (before custom domain)

Use [https://crm-keyra-production.up.railway.app/login](https://crm-keyra-production.up.railway.app/login) until `crm.keyra.ie` is attached.

Railway runs on a **different domain** than `.keyra.ie`, so the shared session cookie is read via **cross-site** calls to `https://auth.keyra.ie` (not the `/api/keyra-auth` proxy). See `railway.env.example`.

| Variable | Railway value |
|----------|----------------|
| `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS` | `false` |
| `KEYRA_AUTH_BACKEND_URL` | `https://auth.keyra.ie` (server proxy upstream only) |
| `NEXT_PUBLIC_CRM_LOGIN_RETURN_URL` | `https://crm-keyra-production.up.railway.app/login?auth_return=1` |
| `NEXT_PUBLIC_KEYRA_GET_STARTED_URL` | `https://get-started.keyra.ie` |

Do **not** set `NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL=/api/keyra-auth` on Railway.

When `crm.keyra.ie` is live, remove `NEXT_PUBLIC_CRM_LOGIN_RETURN_URL` (origin auto-detected) and the app will use the same-origin `/api/keyra-auth` proxy automatically.

## Deploy on Railway

If the app stays on **“Verifying Keyra session…”** (or shows **CRM unavailable**), the deploy cannot reach Postgres or auth bypass was not baked into the build.

### Required variables (Railway → Variables)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Postgres URL **reachable from Railway** (use Railway Postgres plugin or public RDS — not `192.168.x` LAN) |
| `PGSSLMODE` | `require` for most cloud databases |
| `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS` | `false` when DB + real auth are ready |
| `KEYRA_AUTH_BACKEND_URL` | `https://auth.keyra.ie` (upstream for `/api/keyra-auth` proxy on `*.keyra.ie`) |
| `NEXT_PUBLIC_CRM_LOGIN_RETURN_URL` | `https://crm-keyra-production.up.railway.app/login?auth_return=1` until custom domain is live |
| `NEXT_PUBLIC_KEYRA_GET_STARTED_URL` | `https://get-started.keyra.ie` |

**Important:** `NEXT_PUBLIC_*` variables are embedded at **`npm run build`**. After changing them in Railway, trigger a **new deploy / rebuild**, not only a restart.

On **Railway** (`*.up.railway.app`), leave `NEXT_PUBLIC_SIMSECURE_AUTH_BACKEND_URL` **unset** so session checks call `auth.keyra.ie` directly. On **`crm.keyra.ie`**, leave it unset too — the app auto-selects the `/api/keyra-auth` same-origin proxy.

### Railway setup (works with Railway Postgres)

1. In Railway → **New** → **Database** → **PostgreSQL** (or use existing cloud Postgres).
2. On the **crm-keyra** service → **Variables** → add reference:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (or paste the Postgres URL)
   - `PGSSLMODE=require`
   - `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS=true`
   - `RAILWAY_ENVIRONMENT=true` (Railway sets this automatically)
3. **Redeploy** after changing `NEXT_PUBLIC_*` (rebuild required).
4. On deploy, `scripts/start.mjs` runs migrations (`000` auth stubs → `001` schema → `002`/`003` seed) then starts Next.js on `0.0.0.0`.
5. Verify: `/api/db-status` should show `connected: true` and non-zero `counts`.

`000_auth_stubs.sql` creates minimal `auth_users` tables when Railway Postgres is empty.  
Connecting to full **keyra-auth** on your LAN still works locally with `192.168.1.206`.

### Start command

```bash
npm run start
```

Runs migrations then `next start -H 0.0.0.0` (required for Railway networking).

### Quick fix (show the dashboard)

1. Set `NEXT_PUBLIC_CRM_DEV_AUTH_BYPASS=true`
2. Set a valid cloud `DATABASE_URL` (or bypass still shows UI but API pages need DB)
3. Redeploy (full build)
