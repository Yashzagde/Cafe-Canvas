const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

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
  console.log("Applying Migration 030 (Fix Security and RLS Backlog) to Supabase database...");
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '030_fix_security_and_rls_backlog.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log("Executing migration SQL file...");
    await sql.unsafe(migrationSql);
    
    // Insert into schema_migrations to record it as applied
    console.log("Recording migration 030 in schema_migrations...");
    await sql`INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('030') ON CONFLICT DO NOTHING`;
    
    console.log("✓ Migration 030 applied successfully.");
  } catch (err) {
    console.error("❌ Failed to apply Migration 030:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
