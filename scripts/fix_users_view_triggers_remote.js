const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL is missing in .env.local");
    return;
  }

  let connectionConfig;
  try {
    const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/(.+)/;
    const match = dbUrl.match(urlPattern);
    if (match) {
      const [_, user, pass, host, port, db] = match;
      let directHost = host;
      if (host.includes('pooler.supabase.com')) {
        const projectRef = user.split('.')[1];
        if (projectRef) {
          directHost = `db.${projectRef}.supabase.co`;
        }
      }
      connectionConfig = {
        host: directHost,
        port: 5432,
        database: db,
        username: user.split('.')[0] || 'postgres',
        password: pass,
        ssl: 'require',
        max: 1,
        connect_timeout: 30
      };
    } else {
      connectionConfig = dbUrl;
    }
  } catch (err) {
    connectionConfig = dbUrl;
  }

  const sql = typeof connectionConfig === 'object' ? postgres(connectionConfig) : postgres(connectionConfig, { ssl: 'require' });

  try {
    console.log("Fixing handle_users_view_insert trigger function...");
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.handle_users_view_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.staff_accounts (
          id, tenant_id, location_id, auth_user_id, full_name, email, phone, role, pin, is_active
        ) VALUES (
          COALESCE(NEW.id, gen_random_uuid()),
          NEW.tenant_id,
          NEW.branch_id,
          NEW.id,
          COALESCE(NEW.name, 'Staff Member'),
          NEW.email,
          NEW.phone,
          NEW.role,
          NEW.pin_hash,
          COALESCE(NEW.active, NEW.status = 'ACTIVE', TRUE)
        )
        ON CONFLICT (id) DO UPDATE SET
          tenant_id = EXCLUDED.tenant_id,
          location_id = EXCLUDED.location_id,
          auth_user_id = EXCLUDED.auth_user_id,
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          role = EXCLUDED.role,
          pin = EXCLUDED.pin,
          is_active = EXCLUDED.is_active;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✓ handle_users_view_insert fixed.");

    console.log("Fixing handle_users_view_update trigger function...");
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.handle_users_view_update()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE public.staff_accounts SET
          tenant_id = NEW.tenant_id,
          location_id = NEW.branch_id,
          auth_user_id = NEW.id,
          full_name = COALESCE(NEW.name, OLD.full_name),
          email = NEW.email,
          phone = NEW.phone,
          role = NEW.role,
          pin = NEW.pin_hash,
          is_active = COALESCE(NEW.active, NEW.status = 'ACTIVE', TRUE)
        WHERE id = OLD.id OR auth_user_id = OLD.id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log("✓ handle_users_view_update fixed.");
    console.log("===============================================");
    console.log("🎉 Database trigger function fixes applied!");
    console.log("===============================================");

  } catch (err) {
    console.error("❌ SQL Execution failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
