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
    console.log("Adding service_charge_type and service_charge_value columns to store_settings table...");
    await sql`
      ALTER TABLE store_settings 
      ADD COLUMN IF NOT EXISTS service_charge_type TEXT DEFAULT 'none',
      ADD COLUMN IF NOT EXISTS service_charge_value NUMERIC(10, 2) DEFAULT 0.00
    `;
    console.log("✓ Columns added successfully!");

    // Verify
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'store_settings'
    `;
    console.log("STORE_SETTINGS COLUMNS NOW:");
    console.table(columns);
  } catch (err) {
    console.error("Migration failed:", err.message || err);
  } finally {
    await sql.end();
  }
}

run();
