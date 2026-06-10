const postgres = require('postgres');
const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function main() {
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    console.log("=== All RLS Policies ===");
    const policies = await sql`
      SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
      FROM pg_policies
      ORDER BY schemaname, tablename;
    `;
    console.log(policies);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
