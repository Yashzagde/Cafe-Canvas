const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL found in .env.local");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function check() {
  try {
    const constraints = await sql`
      SELECT conname, pg_get_constraintdef(c.oid) as definition
      FROM pg_constraint c 
      JOIN pg_namespace n ON n.oid = c.connamespace 
      WHERE c.conrelid = 'orders'::regclass;
    `;
    console.log("ORDERS TABLE CONSTRAINTS:");
    console.log(JSON.stringify(constraints, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

check();
