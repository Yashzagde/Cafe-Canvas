// @ts-nocheck
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';
const migrationPath = path.resolve(__dirname, '../supabase/migrations/029_godmode_core_tables.sql');

async function run() {
  console.log('Connecting to Supabase...');
  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    console.log('Reading migration file...');
    let sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    // Remove transaction blocks to prevent postgres.js unsafe transaction error
    sqlContent = sqlContent
      .replace(/^\s*BEGIN\s*;\s*$/im, '')
      .replace(/^\s*COMMIT\s*;\s*$/im, '');
    
    console.log('Executing migration 029 on remote database...');
    await sql.unsafe(sqlContent);
    console.log('✅ Migration 029 completed successfully!');
  } catch (err) {
    console.error('❌ Failed to run migration:', err.message);
  } finally {
    await sql.end();
  }
}

run();
