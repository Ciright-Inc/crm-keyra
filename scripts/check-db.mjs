import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:ciright@192.168.1.206:5432/keyra-auth",
});

try {
  const r = await pool.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY 1`
  );
  console.log(r.rows.map((x) => x.table_name).join("\n") || "(no tables)");
} catch (e) {
  console.error(e.message);
} finally {
  await pool.end();
}
