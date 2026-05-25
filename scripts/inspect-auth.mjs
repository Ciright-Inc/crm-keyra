import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:ciright@192.168.1.206:5432/keyra-auth",
});

const tables = ["auth_users", "affiliate_accounts", "developer_accounts"];
for (const t of tables) {
  const cols = await pool.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
    [t]
  );
  console.log(`\n=== ${t} ===`);
  for (const c of cols.rows) console.log(`  ${c.column_name}: ${c.data_type}`);
}
await pool.end();
