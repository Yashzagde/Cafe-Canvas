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
    // Check locations
    console.log("=== Locations ===");
    const locs = await sql`SELECT id, tenant_id, name FROM public.locations;`;
    console.log(locs);

    // Check if JWT hook (inject_tenant_claims) exists and what it does
    console.log("\n=== inject_tenant_claims hook ===");
    const hook = await sql`
      SELECT pg_get_functiondef(p.oid) as def
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE proname = 'inject_tenant_claims';
    `;
    console.log(hook.length > 0 ? hook[0].def : 'NOT FOUND');

    // Simulate what Supabase client would see - test via anon role
    console.log("\n=== Testing RLS as authenticated user a0000000-0000-0000-0000-000000000099 ===");
    
    // Simulate the auth context
    const rlsTest = await sql`
      SELECT 
        public.get_tenant_id() as tenant_id_result,
        public.get_user_role() as role_result;
    `;
    console.log("Note: These will return NULL because we're connecting as postgres superuser, not as an authenticated Supabase user.");
    console.log(rlsTest);
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
