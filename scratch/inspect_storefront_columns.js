const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbUrl = process.env.DATABASE_URL || '';
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'customers';
    `;
    console.table(columns);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
