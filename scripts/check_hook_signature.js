const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is missing.");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    const list = await sql`
      SELECT routine_schema, routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_name = 'inject_tenant_claims';
    `;
    console.log("inject_tenant_claims signature:", list);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
