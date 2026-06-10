const postgres = require('postgres');
const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

async function main() {
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    console.log("=== RLS Policies on storage.objects ===");
    const policies = await sql`
      SELECT policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'objects' AND schemaname = 'storage';
    `;
    console.log(policies);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
