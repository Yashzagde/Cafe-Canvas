const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function check() {
  try {
    for (const table of ['staff_attendance', 'staff_accounts']) {
      const result = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = ${table};
      `;
      const columns = result.map(r => r.column_name);
      console.log(`Columns in ${table}:`, columns.join(', '));
    }
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await sql.end();
  }
}

check();
