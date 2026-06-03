const postgres = require('postgres');

const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 10,
  max: 1,
});

async function run() {
  try {
    console.log("Searching catalog for profiles...");
    const rels = await sql`
      SELECT n.nspname as schema_name, c.relname as name, c.relkind as kind
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = 'profiles';
    `;
    console.log("Catalog objects named 'profiles':", rels);

  } catch (error) {
    console.error("Query failed:", error.message || error);
  } finally {
    await sql.end();
  }
}

run();
