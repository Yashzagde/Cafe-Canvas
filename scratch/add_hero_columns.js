const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    console.log("Adding hero_image_url_2 and hero_image_url_3 columns to storefront_config table...");
    
    await sql`
      ALTER TABLE storefront_config 
      ADD COLUMN IF NOT EXISTS hero_image_url_2 TEXT,
      ADD COLUMN IF NOT EXISTS hero_image_url_3 TEXT;
    `;
    console.log("✓ Columns added successfully!");

    // Verify
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'storefront_config'
      ORDER BY ordinal_position;
    `;
    console.log("Updated storefront_config columns:");
    console.table(columns);

  } catch (err) {
    console.error("❌ Error adding columns:", err.message);
  } finally {
    await sql.end();
  }
}

main();
