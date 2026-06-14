const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function run() {
  try {
    const branches = await sql`SELECT * FROM branches;`;
    const locations = await sql`SELECT * FROM locations;`;
    console.log('Branches:', JSON.stringify(branches, null, 2));
    console.log('Locations:', JSON.stringify(locations, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

run();
