const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is missing.");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    console.log("Redefining inject_tenant_claims to be 100% safe against missing JSON paths...");
    await sql`
      CREATE OR REPLACE FUNCTION public.inject_tenant_claims(event JSONB)
      RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
      DECLARE
        staff_record staff_accounts%ROWTYPE;
      BEGIN
        IF (event->>'user_id') IS NOT NULL AND (event->>'user_id') ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$' THEN
          -- Look up staff details
          SELECT * INTO staff_record FROM staff_accounts WHERE auth_user_id = (event->>'user_id')::UUID;

          IF staff_record.id IS NOT NULL THEN
            -- Ensure event -> 'claims' exists and is an object
            IF (event->'claims') IS NULL OR jsonb_typeof(event->'claims') != 'object' THEN
              event := jsonb_set(event, '{claims}', '{}'::jsonb);
            END IF;

            -- Ensure event -> 'claims' -> 'app_metadata' exists and is an object
            IF (event->'claims'->'app_metadata') IS NULL OR jsonb_typeof(event->'claims'->'app_metadata') != 'object' THEN
              event := jsonb_set(event, '{claims,app_metadata}', '{}'::jsonb);
            END IF;

            -- Set claims individually to preserve other app_metadata keys safely
            event := jsonb_set(event, '{claims,app_metadata,tenant_id}', to_jsonb(staff_record.tenant_id));
            event := jsonb_set(event, '{claims,app_metadata,location_id}', to_jsonb(staff_record.location_id));
            event := jsonb_set(event, '{claims,app_metadata,role}', to_jsonb(staff_record.role));
          END IF;
        END IF;

        RETURN event;
      END;
      $$;
    `;
    console.log("✓ Function redefined successfully.");

    console.log("Granting execution permissions to supabase_auth_admin...");
    await sql`
      GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
    `;
    await sql`
      GRANT EXECUTE ON FUNCTION public.inject_tenant_claims(jsonb) TO supabase_auth_admin;
    `;
    console.log("✓ Permissions granted successfully.");
  } catch (err) {
    console.error("Failed to apply fixes:", err.message);
  } finally {
    await sql.end();
  }
}

main();
