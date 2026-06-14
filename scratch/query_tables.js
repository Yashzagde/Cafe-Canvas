const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function run() {
  try {
    const tables = await sql`
      SELECT * FROM tables LIMIT 10;
    `;
    console.log('Tables rows count:', tables.length);
    console.log('Tables rows:', JSON.stringify(tables, null, 2));
  } catch (err) {
    console.error('Error querying tables:', err);
  } finally {
    await sql.end();
  }
}

run();
