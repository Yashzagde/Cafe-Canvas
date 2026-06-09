// @ts-nocheck
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
    console.log("Adding deleted_at column to menu_categories...");
    await sql`ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`;
    
    console.log("Adding deleted_at column to menu_items...");
    await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`;
    
    console.log("Adding deleted_at column to customers...");
    await sql`ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`;

    console.log("Columns successfully added!");
  } catch (err) {
    console.error("❌ Error adding columns:", err.message);
  } finally {
    await sql.end();
  }
}

main();
