const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function check() {
  try {
    const tenants = await sql`
      SELECT id, name, slug, public_id
      FROM tenants
    `;
    console.log("TENANTS WITH PUBLIC_ID:");
    console.log(tenants);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

check();
