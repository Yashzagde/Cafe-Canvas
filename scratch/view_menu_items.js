const postgres = require('postgres');
require('dotenv').config({ path: 'd:/Cafe Canva/.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

async function run() {
  try {
    const items = await sql`
      SELECT 
        mi.id as item_id, 
        mi.name as item_name, 
        mi.price as item_price, 
        mi.is_available, 
        mi.tenant_id,
        t.name as tenant_name,
        mc.id as category_id,
        mc.name as category_name
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      LEFT JOIN tenants t ON mi.tenant_id = t.id
      ORDER BY t.name ASC, mc.name ASC, mi.name ASC
    `;
    console.log("Current menu items in DB with Tenant & Category:");
    console.table(items);
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
