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
    console.log("=== Buckets ===");
    const buckets = await sql`SELECT id, name FROM storage.buckets;`;
    console.log(buckets);

    console.log("\n=== Objects in themes bucket ===");
    const objects = await sql`
      SELECT id, name, metadata, bucket_id
      FROM storage.objects
      WHERE bucket_id = 'themes';
    `;
    console.log(objects.slice(0, 10));
    console.log("Total themes found:", objects.length);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
