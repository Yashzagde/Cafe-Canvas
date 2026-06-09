// @ts-nocheck
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
    // 1. Check get_tenant_id function definition
    console.log("=== get_tenant_id ===");
    const f1 = await sql`
      SELECT pg_get_functiondef(p.oid) as def
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE proname = 'get_tenant_id' AND n.nspname = 'public';
    `;
    console.log(f1[0]?.def || 'NOT FOUND');

    // 2. Check get_user_role function definition
    console.log("\n=== get_user_role ===");
    const f2 = await sql`
      SELECT pg_get_functiondef(p.oid) as def
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE proname = 'get_user_role' AND n.nspname = 'public';
    `;
    console.log(f2[0]?.def || 'NOT FOUND');

    // 3. Check if RLS is enabled on staff_accounts
    console.log("\n=== RLS status on staff_accounts ===");
    const rls = await sql`
      SELECT relname, relrowsecurity, relforcerowsecurity
      FROM pg_class
      WHERE relname = 'staff_accounts';
    `;
    console.log(rls);

    // 4. Check all constraints
    console.log("\n=== Constraints on staff_accounts ===");
    const constraints = await sql`
      SELECT conname, pg_get_constraintdef(c.oid) as def
      FROM pg_constraint c
      WHERE conrelid = 'public.staff_accounts'::regclass;
    `;
    console.log(constraints);

    // 5. Try a direct insert as superuser to see if it works
    console.log("\n=== Attempting direct insert test ===");
    const testResult = await sql`
      INSERT INTO public.staff_accounts (tenant_id, full_name, email, phone, role, pin, is_active)
      VALUES (
        'c1000000-0000-0000-0000-000000000001',
        'Direct Test',
        'direct.test.delete.me@example.com',
        '1234567890',
        'staff',
        '9999',
        true
      )
      RETURNING id, full_name, email;
    `;
    console.log("Direct insert SUCCESS:", testResult);

    // Clean up test
    await sql`DELETE FROM public.staff_accounts WHERE email = 'direct.test.delete.me@example.com';`;
    console.log("Test row cleaned up.");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
