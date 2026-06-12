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
    // Read migration 014
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '014_db_optimizations.sql');
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at ${migrationPath}`);
    }

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    console.log('Executing migration 014...');
    await sql.unsafe(sqlContent);
    console.log('✓ Database optimized successfully with new indexes!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await sql.end();
  }
}

main();
