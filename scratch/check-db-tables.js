// @ts-nocheck
const postgres = require('postgres');
require('dotenv').config();

const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function checkTables() {
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    console.log('Querying table names in public schema...');
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('Existing tables:');
    result.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
  } catch (err) {
    console.error('Error connecting/querying database:', err.message);
  } finally {
    await sql.end();
  }
}

checkTables();
