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
    console.log("Redefining inject_tenant_claims to return event immediately...");
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.inject_tenant_claims(event JSONB)
      RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
      BEGIN
        RETURN event;
      END;
      $$;
    `);
    console.log("✓ Hook function simplified.");
  } catch (err) {
    console.error("❌ Failed to simplify hook:", err.message);
  } finally {
    await sql.end();
  }
}

main();
