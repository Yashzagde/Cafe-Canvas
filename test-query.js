const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { ssl: 'require', prepare: false });

async function run() {
  try {
    const rows = await sql`SELECT * FROM pre_registrations ORDER BY created_at DESC LIMIT 10`;
    console.log('\n--- Recent Pre-Registrations ---');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error fetching pre-registrations:', err.message);
  } finally {
    await sql.end();
  }
}

run();
