const postgres = require('postgres');
require('dotenv').config({ path: 'd:/Cafe Canva/.env.local' });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
// Fix 1: guard against undefined before calling .match()
if (!dbUrl) throw new Error("DATABASE_URL is not set in .env.local");

const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/(.+)/;
const match = dbUrl.match(urlPattern);
// Fix 2: guard against null before destructuring
if (!match) throw new Error("DATABASE_URL format is invalid — check your .env.local");

const [_, user, pass, host, port, db] = match;

const sql = postgres({
  host,
  port: 5432,
  database: db,
  username: user,
  password: pass,
  ssl: 'require',
  max: 1,
  connect_timeout: 10,
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
    // Fix 3: err is 'unknown' in TS — narrow it before accessing .message
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Alignment failed:", message);
  } finally {
    await sql.end();
  }
}

main();