const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    console.log("Querying database constraints on staff_accounts...");
    const constraints = await sql`
      SELECT conname, pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'public.staff_accounts'::regclass;
    `;
    console.log("Constraints on staff_accounts:", constraints);

    console.log("\nQuerying database constraints on notification_log...");
    const notifConstraints = await sql`
      SELECT conname, pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      JOIN pg_namespace n ON n.oid = c.connamespace
      WHERE conrelid = 'public.notification_log'::regclass;
    `;
    console.log("Constraints on notification_log:", notifConstraints);

  } catch (err) {
    console.error("❌ Query failed:", err);
  } finally {
    await sql.end();
  }
}

main();
