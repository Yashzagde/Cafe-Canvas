// @ts-nocheck
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clear PG environment variables to prevent postgres client from picking up AWS DSQL credentials
delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL not found in .env.local file.");
  process.exit(1);
}

// Connect to Session-mode pooler or direct DB
const sql = postgres(dbUrl, { ssl: 'require', max: 1, connect_timeout: 30 });

async function run() {
  console.log("=================================================");
  console.log(" CafeCanvas Database Schema v3.0 Migration Runner ");
  console.log("=================================================\n");

  try {
    const migrationFile = path.join(__dirname, '..', 'supabase', 'migrate_v3.sql');
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found at ${migrationFile}`);
    }

    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    
    console.log("Connecting to remote database...");
    await sql`SELECT 1`;
    console.log("Connected successfully!");

    console.log("\nExecuting schema migration v3.0 (migrate_v3.sql)...");
    
    // Execute all SQL statements in a single batch
    await sql.unsafe(sqlContent);
    
    console.log("\n=================================================");
    console.log("✓ Schema v3.0 migration applied successfully!");
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error.message || error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
