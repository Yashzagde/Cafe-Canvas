const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL || '';
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    console.log('=== Querying function signatures in public schema ===');
    const result = await sql`
      SELECT 
        p.proname as name,
        pg_get_function_identity_arguments(p.oid) as args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
      ORDER BY p.proname;
    `;
    result.forEach(row => {
      console.log(`- ${row.name}(${row.args})`);
    });
  } catch (err) {
    console.error('Error querying signatures:', err instanceof Error ? err.message : String(err));
  } finally {
    await sql.end();
  }
}

main();
