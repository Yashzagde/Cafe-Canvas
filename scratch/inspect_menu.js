const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dbUrl = process.env.DATABASE_URL || '';
const sql = postgres(dbUrl, { ssl: 'require' });

async function run() {
  try {
    const items = await sql`
      SELECT id, name, description, category_id, tenant_id 
      FROM menu_items 
      WHERE name ILIKE 'roti'
    `;
    console.log("Found Roti Items:", JSON.stringify(items, null, 2));

    for (const item of items) {
      console.log(`Processing Roti Item: ${item.id} for Tenant: ${item.tenant_id}`);
      
      // Find or create 'Food' category for this tenant
      let categories = await sql`
        SELECT id, name 
        FROM menu_categories 
        WHERE tenant_id = ${item.tenant_id} AND name IN ('Food', 'Snacks', 'FOOD', 'SNACKS')
        AND deleted_at IS NULL
      `;
      
      let targetCat = categories.find(c => c.name.toLowerCase() === 'food') || categories[0];
      
      if (!targetCat) {
        console.log(`Creating 'Food' category for Tenant: ${item.tenant_id}...`);
        const [newCat] = await sql`
          INSERT INTO menu_categories (tenant_id, name, is_visible)
          VALUES (${item.tenant_id}, 'Food', true)
          RETURNING id, name
        `;
        targetCat = newCat;
      }
      
      const [updated] = await sql`
        UPDATE menu_items 
        SET 
          category_id = ${targetCat.id}, 
          description = 'Normal Roti',
          name = 'Roti'
        WHERE id = ${item.id}
        RETURNING id, name, description, category_id
      `;
      console.log(`Updated item ${item.id}:`, JSON.stringify(updated, null, 2));
    }
  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await sql.end();
  }
}

run();
