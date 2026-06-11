const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function query() {
  try {
    console.log("Fetching tenants...");
    const tenants = await sql`SELECT id, name, slug, public_id, private_id FROM tenants`;
    console.table(tenants);

    if (tenants.length > 0) {
      const tenantId = tenants[0].id;
      console.log(`\nFetching locations for tenant ${tenantId}...`);
      const locations = await sql`SELECT id, tenant_id, name FROM locations WHERE tenant_id = ${tenantId}`;
      console.table(locations);

      console.log(`\nFetching staff accounts for tenant ${tenantId}...`);
      const staff = await sql`SELECT id, tenant_id, name, role, email FROM staff_accounts WHERE tenant_id = ${tenantId}`;
      console.table(staff);

      console.log(`\nFetching tables for tenant ${tenantId}...`);
      const tables = await sql`SELECT id, location_id, table_number, status FROM tables WHERE tenant_id = ${tenantId}`;
      console.table(tables);

      console.log(`\nFetching staff calls for tenant ${tenantId}...`);
      const calls = await sql`SELECT * FROM staff_calls WHERE tenant_id = ${tenantId}`;
      console.table(calls);
    }
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await sql.end();
  }
}

query();
