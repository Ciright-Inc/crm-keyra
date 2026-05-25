-- Minimal Keyra auth tables for standalone CRM deploy (e.g. Railway Postgres).
-- No-op when connecting to full keyra-auth — tables already exist.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  display_name VARCHAR(255),
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name VARCHAR(255),
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS developer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name VARCHAR(255),
  status VARCHAR(32) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO auth_users (email, display_name, status)
SELECT 'crm-admin@keyra.ie', 'CRM System Admin', 'active'
WHERE NOT EXISTS (SELECT 1 FROM auth_users LIMIT 1);
