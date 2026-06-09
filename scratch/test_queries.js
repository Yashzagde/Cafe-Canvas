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
    console.log("=== Testing menu_categories query with deleted_at ===");
    try {
      const res1 = await sql`
        SELECT id, name
        FROM menu_categories
        WHERE tenant_id = 'c1000000-0000-0000-0000-000000000001' AND deleted_at IS NULL;
      `;
      console.log("Success:", res1);
    } catch (e) {
      console.error("Failed:", e.message);
    }

    console.log("\n=== Testing menu_items query with deleted_at ===");
    try {
      const res2 = await sql`
        SELECT *
        FROM menu_items
        WHERE tenant_id = 'c1000000-0000-0000-0000-000000000001' AND deleted_at IS NULL;
      `;
      console.log("Success:", res2);
    } catch (e) {
      console.error("Failed:", e.message);
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
