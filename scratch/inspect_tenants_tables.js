const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dbUrl = process.env.DATABASE_URL;
const sql = postgres(dbUrl, { ssl: 'require' });

async function query() {
  try {
    const tenants = await sql`SELECT id, name, slug, public_id FROM tenants`;
    console.log("--- TENANTS ---");
    console.log(JSON.stringify(tenants, null, 2));

    const tables = await sql`SELECT id, tenant_id, table_number FROM tables`;
    console.log("--- TABLES ---");
    console.log(JSON.stringify(tables, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

query();
