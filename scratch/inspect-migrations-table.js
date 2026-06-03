const postgres = require('postgres');

const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 10,
  max: 1,
});

async function run() {
  try {
    console.log("Checking supabase_migrations table structure and records...");
    
    // Check if the schema table exists and list columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations';
    `;
    console.log("Columns:", columns);
    
    if (columns.length > 0) {
      // List existing records
      const records = await sql`
        SELECT * FROM supabase_migrations.schema_migrations;
      `;
      console.log("Migration tracking records:", records);
    } else {
      console.log("supabase_migrations.schema_migrations table does not exist!");
    }
  } catch (error) {
    console.error("Query failed:", error.message || error);
  } finally {
    await sql.end();
  }
}

run();
