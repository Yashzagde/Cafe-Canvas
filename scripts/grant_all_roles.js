const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is missing.");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require', connect_timeout: 15 });
  try {
    console.log("Granting execution permissions to all roles...");
    await sql.unsafe(`
      GRANT USAGE ON SCHEMA public TO authenticator;
      GRANT USAGE ON SCHEMA public TO authenticated;
      GRANT USAGE ON SCHEMA public TO anon;
      GRANT USAGE ON SCHEMA public TO service_role;
      
      GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO authenticator;
      GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO authenticated;
      GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO anon;
      GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO service_role;
      GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO PUBLIC;
    `);
    console.log("✓ Permissions granted successfully.");
  } catch (err) {
    console.error("Failed to grant permissions:", err.message);
  } finally {
    await sql.end();
  }
}

main();
