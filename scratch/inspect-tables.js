const postgres = require('postgres');

const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 10,
  max: 1,
});

async function run() {
  try {
    console.log("Listing all tables in public schema...");
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log("Tables in public schema:");
    tables.forEach(t => console.log(`- ${t.table_name}`));

    console.log("\nChecking details for users table...");
    const usersCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `;
    console.log("users table columns:");
    usersCols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

    console.log("\nChecking details for profiles table if any...");
    const profilesCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `;
    console.log("profiles table columns:", profilesCols);

  } catch (error) {
    console.error("Query failed:", error.message || error);
  } finally {
    await sql.end();
  }
}

run();
