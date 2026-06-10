const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function run() {
  try {
    console.log("Applying hero slides migration...");
    await sql`
      ALTER TABLE storefront_config 
      ADD COLUMN IF NOT EXISTS hero_title TEXT,
      ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
      ADD COLUMN IF NOT EXISTS hero_title_2 TEXT,
      ADD COLUMN IF NOT EXISTS hero_subtitle_2 TEXT,
      ADD COLUMN IF NOT EXISTS hero_title_3 TEXT,
      ADD COLUMN IF NOT EXISTS hero_subtitle_3 TEXT
    `;
    console.log("✓ Migration applied successfully!");

    // Verify columns again
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'storefront_config' AND column_name LIKE 'hero_%'
    `;
    console.log("VERIFIED HERO COLUMNS:");
    console.table(columns);
  } catch (err) {
    console.error("Migration failed:", err.message || err);
  } finally {
    await sql.end();
  }
}

run();
