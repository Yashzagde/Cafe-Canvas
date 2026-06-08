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
    console.log("Querying auth.users for yashzagde01@gmail.com...");
    const user = await sql`
      SELECT id, email, role, aud
      FROM auth.users
      WHERE email = 'yashzagde01@gmail.com';
    `;
    console.log("Auth user:", user);
  } catch (err) {
    console.error("❌ Query failed:", err);
  } finally {
    await sql.end();
  }
}

main();
