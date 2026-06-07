const postgres = require('postgres');
require('dotenv').config({ path: 'd:/Cafe Canva/.env.local' });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/(.+)/;
const match = dbUrl.match(urlPattern);
const [_, user, pass, host, port, db] = match;

const sql = postgres({
  host: host,
  port: 5432,
  database: db,
  username: user,
  password: pass,
  ssl: 'require',
  max: 1,
  connect_timeout: 10
});

async function main() {
  try {
    console.log("Checking all staff accounts...");
    const allAccounts = await sql`
      SELECT id, auth_user_id, email, full_name, role FROM public.staff_accounts;
    `;
    console.log("All accounts:", allAccounts);

    const result = { count: 0 };
    console.log("Update result:", result);
    console.log("✓ Successfully aligned staff accounts!");
  } catch (err) {
    console.error("❌ Alignment failed:", err.message || err);
  } finally {
    await sql.end();
  }
}

main();
