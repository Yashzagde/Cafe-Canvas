const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbUrl = process.env.DATABASE_URL || '';
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    const rows = await sql`
      SELECT id, tenant_id, hero_slides
      FROM public.storefront_config;
    `;
    console.log("Storefront config rows:", JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
