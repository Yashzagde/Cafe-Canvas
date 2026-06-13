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
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'staff_accounts'
    `;
    console.log("STAFF_ACCOUNTS COLUMNS:");
    console.log(columns);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

check();
