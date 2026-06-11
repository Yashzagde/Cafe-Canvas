const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clear PG environment variables to prevent postgres client from picking up AWS DSQL credentials instead of DATABASE_URL
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
  console.log("Applying Migration 011 to Supabase database (pooled mode, sequential execution)...");
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '011_audit_logs_and_staff_calls.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // Split queries by semicolon and filter out empty statements
  const queries = migrationSql
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  try {
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`Executing statement ${i + 1}/${queries.length}...`);
      await sql.unsafe(query);
    }
    console.log("✓ Migration 011 applied successfully.");
  } catch (err) {
    console.error("❌ Failed to apply Migration 011:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
