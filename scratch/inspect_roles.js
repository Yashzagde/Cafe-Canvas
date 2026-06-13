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
    const statuses = await sql`
      SELECT DISTINCT status FROM staff_calls;
    `;
    console.log('Existing statuses in staff_calls:', statuses);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

main();
