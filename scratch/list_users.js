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
    console.log("--- STAFF ACCOUNTS ---");
    const staff = await sql`SELECT id, email, role, pin, full_name, auth_user_id FROM public.staff_accounts`;
    console.log(JSON.stringify(staff, null, 2));

    console.log("\n--- AUTH USERS ---");
    const authUsers = await sql`SELECT id, email, email_confirmed_at, raw_app_meta_data FROM auth.users`;
    console.log(JSON.stringify(authUsers, null, 2));

  } catch (err) {
    console.error("❌ SQL Query failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
