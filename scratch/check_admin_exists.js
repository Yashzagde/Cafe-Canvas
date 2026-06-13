const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL is missing in .env.local");
    return;
  }

  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    const tenants = await sql`SELECT id, name, slug FROM public.tenants`;
    console.log("Registered tenants:");
    console.table(tenants);

    const staff = await sql`SELECT id, email, role, pin, tenant_id FROM public.staff_accounts`;
    console.log("Registered staff accounts:");
    console.table(staff);

  } catch (err) {
    console.error("❌ SQL Query failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
