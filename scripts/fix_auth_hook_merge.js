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
    console.log("Redefining inject_tenant_claims to use stable JSONB merge (||) via sql.unsafe()...");
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.inject_tenant_claims(event JSONB)
      RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
      DECLARE
        staff_record staff_accounts%ROWTYPE;
      BEGIN
        IF (event->>'user_id') IS NOT NULL AND (event->>'user_id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
          -- Look up staff details
          SELECT * INTO staff_record FROM staff_accounts WHERE auth_user_id = (event->>'user_id')::UUID;

          IF staff_record.id IS NOT NULL THEN
            -- Merge claims and app_metadata safely using JSONB merge operator (||)
            event := event || jsonb_build_object(
              'claims', COALESCE(event->'claims', '{}'::jsonb) || jsonb_build_object(
                'app_metadata', COALESCE(event->'claims'->'app_metadata', '{}'::jsonb) || jsonb_build_object(
                  'tenant_id', staff_record.tenant_id,
                  'location_id', staff_record.location_id,
                  'role',      staff_record.role
                )
              )
            );
          END IF;
        END IF;

        RETURN event;
      END;
      $$;
    `);
    console.log("✓ Function redefined successfully.");

    console.log("Granting execution permissions to supabase_auth_admin...");
    await sql.unsafe("GRANT USAGE ON SCHEMA public TO supabase_auth_admin;");
    await sql.unsafe("GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO supabase_auth_admin;");
    console.log("✓ Permissions granted successfully.");
  } catch (err) {
    console.error("Failed to apply fixes:", err.message);
  } finally {
    await sql.end();
  }
}

main();
