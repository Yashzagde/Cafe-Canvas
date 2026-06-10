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
    console.log("Adding public_id column to tenants table...");
    await sql`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid() UNIQUE
    `;
    console.log("✓ public_id column added successfully!");

    // Verify
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tenants'
    `;
    console.log("TENANTS COLUMNS NOW:");
    console.table(columns);
  } catch (err) {
    console.error("Migration failed:", err.message || err);
  } finally {
    await sql.end();
  }
}

run();
