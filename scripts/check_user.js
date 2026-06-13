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

  // Parse DATABASE_URL: postgresql://<user>:<password>@<host>:<port>/<db>
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
        ssl: /** @type {any} */ ('require'),
        max: 1,
        connect_timeout: 30
      };
    } else {
      connectionConfig = dbUrl;
    }
  } catch (err) {
    connectionConfig = dbUrl;
  }

  const sql = typeof connectionConfig === 'object' ? postgres(connectionConfig) : postgres(connectionConfig, { ssl: /** @type {any} */ ('require') });

  try {
    const emailToCheck = 'waiter01@cafecanvas.bar';
    console.log(`Checking database records for: ${emailToCheck}...\n`);

    // 1. Check auth.users
    const authUsers = await sql`
      SELECT id, email, encrypted_password IS NOT NULL as has_password, email_confirmed_at, raw_app_meta_data
      FROM auth.users 
      WHERE email = ${emailToCheck}
    `;

    if (authUsers.length === 0) {
      console.log("❌ User not found in auth.users table!");
    } else {
      console.log("✅ User found in auth.users:");
      console.log(`- ID: ${authUsers[0].id}`);
      console.log(`- Email: ${authUsers[0].email}`);
      console.log(`- Confirmed At: ${authUsers[0].email_confirmed_at}`);
      console.log(`- App Metadata: ${JSON.stringify(authUsers[0].raw_app_meta_data)}`);
    }

    // 2. Check auth.identities
    const identities = await sql`
      SELECT id, provider_id, provider
      FROM auth.identities 
      WHERE provider_id = ${emailToCheck} OR user_id IN (SELECT id FROM auth.users WHERE email = ${emailToCheck})
    `;
    if (identities.length === 0) {
      console.log("❌ No identity record found in auth.identities!");
    } else {
      console.log("✅ Identity record found in auth.identities:");
      console.log(`- Identity ID: ${identities[0].id}`);
      console.log(`- Provider: ${identities[0].provider}`);
    }

    // 3. Check public.staff_accounts
    const staff = await sql`
      SELECT id, email, role, pin, is_active, tenant_id
      FROM public.staff_accounts 
      WHERE email = ${emailToCheck}
    `;

    if (staff.length === 0) {
      console.log("❌ Staff record not found in public.staff_accounts!");
    } else {
      console.log("✅ Staff record found in public.staff_accounts:");
      console.log(`- ID: ${staff[0].id}`);
      console.log(`- Role: ${staff[0].role}`);
      console.log(`- PIN: ${staff[0].pin}`);
      console.log(`- Active: ${staff[0].is_active}`);
      console.log(`- Tenant ID: ${staff[0].tenant_id}`);
    }

  } catch (err) {
    console.error("❌ SQL Query failed:", err instanceof Error ? err.message : String(err));
  } finally {
    await sql.end();
  }
}

main();
