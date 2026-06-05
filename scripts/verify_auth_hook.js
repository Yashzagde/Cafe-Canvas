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
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auth';
    `;
    console.log("Tables in auth schema:", tables.map(t => t.table_name));
  } catch (err) {
    console.error("Error checking auth tables:", err.message);
  } finally {
    await sql.end();
  }
}

main();
