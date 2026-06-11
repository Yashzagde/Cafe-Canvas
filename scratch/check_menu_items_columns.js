const postgres = require('postgres');
require('dotenv').config({ path: 'd:/Cafe Canva/.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

async function run() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'menu_items'
    `;
    console.log("Columns of menu_items table:");
    console.table(columns);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
