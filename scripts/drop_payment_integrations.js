const postgres = require('postgres');

const sql = postgres({
  host: 'db.oeringgdbxmmihgvuyfa.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'XASzdcFrmbyXuGOn',
  ssl: 'require',
  max: 1,
  connect_timeout: 30
});

async function main() {
  console.log("Dropping payment_integrations table from remote database...");
  try {
    await sql.unsafe(`DROP TABLE IF EXISTS public.payment_integrations CASCADE;`);
    console.log("✓ payment_integrations table dropped successfully.");
  } catch (err) {
    console.error("❌ Failed to drop table:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
