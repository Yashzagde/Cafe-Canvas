// @ts-nocheck
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
    const checkTables = ['menu_categories', 'menu_items', 'tables', 'customers'];
    for (const tbl of checkTables) {
      console.log(`\n=== Columns of ${tbl} ===`);
      const cols = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = ${tbl};
      `;
      console.log(cols.map(c => `${c.column_name}: ${c.data_type} (nullable=${c.is_nullable})`));
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
