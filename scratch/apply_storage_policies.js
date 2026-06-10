const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    console.log("Applying storage policies...");
    
    await sql`
      DROP POLICY IF EXISTS "Allow public select on storage objects" ON storage.objects;
    `;
    console.log("✓ SELECT policy dropped if exists");
    await sql`
      CREATE POLICY "Allow public select on storage objects" ON storage.objects
        FOR SELECT
        TO public
        USING (bucket_id IN ('logos', 'themes'));
    `;
    console.log("✓ SELECT policy created");

    await sql`
      DROP POLICY IF EXISTS "Allow authenticated insert on storage objects" ON storage.objects;
    `;
    await sql`
      CREATE POLICY "Allow authenticated insert on storage objects" ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id IN ('logos', 'themes'));
    `;
    console.log("✓ INSERT policy created");

    await sql`
      DROP POLICY IF EXISTS "Allow authenticated update on storage objects" ON storage.objects;
    `;
    await sql`
      CREATE POLICY "Allow authenticated update on storage objects" ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id IN ('logos', 'themes'));
    `;
    console.log("✓ UPDATE policy created");

    await sql`
      DROP POLICY IF EXISTS "Allow authenticated delete on storage objects" ON storage.objects;
    `;
    await sql`
      CREATE POLICY "Allow authenticated delete on storage objects" ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id IN ('logos', 'themes'));
    `;
    console.log("✓ DELETE policy created");

    console.log("\n=== Verifying RLS Policies on storage.objects ===");
    const policies = await sql`
      SELECT policyname, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'objects' AND schemaname = 'storage';
    `;
    console.log(policies);

  } catch (err) {
    console.error("❌ Error applying policies:", err.message);
  } finally {
    await sql.end();
  }
}

main();
