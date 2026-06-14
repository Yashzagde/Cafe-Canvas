const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function check() {
  try {
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'store_settings';
    `;
    const columns = result.map(r => r.column_name);
    console.log('Columns in store_settings:', columns.join(', '));
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await sql.end();
  }
}

check();
