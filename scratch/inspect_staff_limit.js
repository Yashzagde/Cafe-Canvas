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
    console.log("Querying definition of check_staff_limit function...");
    const func = await sql`
      SELECT pg_get_functiondef(p.oid) as def
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE proname = 'check_staff_limit';
    `;
    console.log("check_staff_limit source code:");
    console.log(func[0]?.def);
  } catch (err) {
    console.error("❌ Query failed:", err);
  } finally {
    await sql.end();
  }
}

main();
