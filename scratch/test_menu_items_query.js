const postgres = require('postgres');
require('dotenv').config({ path: 'd:/Cafe Canva/.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

async function run() {
  try {
    // Attempting query with branch_id / location_id filter
    const result = await sql`
      SELECT * FROM menu_items WHERE branch_id = 'some-branch-id'
    `;
    console.log("Query succeeded:", result);
  } catch (err) {
    console.error("Query failed:", err.message || err);
  } finally {
    await sql.end();
  }
}

run();
