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
    console.log("Updating get_tenant_id helper function to PL/pgSQL to prevent inlining recursion...");
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.get_tenant_id()
      RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
      DECLARE
        tid UUID;
      BEGIN
        SELECT (NULLIF(auth.jwt()->'app_metadata'->>'tenant_id', ''))::UUID INTO tid;
        IF tid IS NULL THEN
          SELECT tenant_id INTO tid FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1;
        END IF;
        RETURN tid;
      END;
      $$;
    `);

    console.log("Updating get_location_id helper function to PL/pgSQL...");
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.get_location_id()
      RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
      DECLARE
        lid UUID;
      BEGIN
        SELECT (NULLIF(auth.jwt()->'app_metadata'->>'location_id', ''))::UUID INTO lid;
        IF lid IS NULL THEN
          SELECT location_id INTO lid FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1;
        END IF;
        RETURN lid;
      END;
      $$;
    `);

    console.log("Updating get_user_role helper function to PL/pgSQL...");
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.get_user_role()
      RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
      DECLARE
        u_role TEXT;
      BEGIN
        SELECT auth.jwt()->'app_metadata'->>'role' INTO u_role;
        IF u_role IS NULL THEN
          SELECT role INTO u_role FROM staff_accounts WHERE auth_user_id = auth.uid() LIMIT 1;
        END IF;
        RETURN u_role;
      END;
      $$;
    `);

    console.log("✓ RLS helper functions successfully migrated to PL/pgSQL!");
  } catch (err) {
    console.error("❌ Failed to update RLS helpers:", err.message);
  } finally {
    await sql.end();
  }
}

main();
