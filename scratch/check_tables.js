const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function check() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    const tables = result.map(r => r.table_name);
    console.log('Tables in public schema:', tables.join(', '));
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await sql.end();
  }
}

check();
