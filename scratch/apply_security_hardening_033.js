// @ts-nocheck
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL || '';
const sql = postgres(dbUrl, { ssl: 'require', max: 1, connect_timeout: 30 });

async function run() {
  console.log("=================================================");
  console.log(" CafeCanvas RPC Security Hardening Runner (033) ");
  console.log("=================================================\n");

  try {
    const migrationFile = path.join(__dirname, '..', 'supabase', 'migrations', '033_security_hardening_policies.sql');
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found at ${migrationFile}`);
    }

    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    
    console.log("Connecting to remote database...");
    await sql`SELECT 1`;
    console.log("Connected successfully!");

    console.log("\nExecuting RPC hardening policies...");
    await sql.unsafe(sqlContent);
    
    console.log("\n=================================================");
    console.log("✓ RPC hardening (033) applied successfully!");
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ Security hardening execution failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
