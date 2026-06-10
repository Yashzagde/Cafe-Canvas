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
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'storefront_config';
    `;
    console.log("storefront_config table columns:");
    console.table(columns);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
