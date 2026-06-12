// @ts-nocheck
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clear other PG variables to force using DATABASE_URL
delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function main() {
  console.log('Connecting to database...');
  const sql = postgres(dbUrl, {
    ssl: 'require',
    connect_timeout: 15,
  });

  try {
    // Read migration 016
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '016_customer_otp_sessions.sql');
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at ${migrationPath}`);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    console.log('Executing migration 016...');
    await sql.unsafe(sqlContent);
    console.log('✓ Migration 016 (customer_otp_sessions table & checkin RPC functions) completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await sql.end();
  }
}

main();
