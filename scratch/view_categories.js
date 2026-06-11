const postgres = require('postgres');
require('dotenv').config({ path: 'd:/Cafe Canva/.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

async function run() {
  try {
    const categories = await sql`
      SELECT id, name, is_visible, deleted_at 
      FROM menu_categories
      ORDER BY name ASC
    `;
    console.log("Current menu categories in DB:");
    console.table(categories);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
