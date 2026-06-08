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
    console.log("Querying all staff accounts in public.staff_accounts...");
    const staff = await sql`
      SELECT id, tenant_id, full_name, email, role, pin, is_active, auth_user_id
      FROM public.staff_accounts;
    `;
    console.table(staff);
  } catch (err) {
    console.error("❌ Query failed:", err);
  } finally {
    await sql.end();
  }
}

main();
