const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const sql = postgres({
  host: 'db.oeringgdbxmmihgvuyfa.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'XASzdcFrmbyXuGOn',
  ssl: 'require',
  max: 1
});

async function main() {
  try {
    console.log("Dropping check constraint on staff_calls...");
    await sql`ALTER TABLE public.staff_calls DROP CONSTRAINT IF EXISTS staff_calls_status_check;`;
    console.log("✓ Constraint dropped successfully.");
  } catch (err) {
    console.error("❌ Failed to drop constraint:", err);
  } finally {
    await sql.end();
  }
}

main();
