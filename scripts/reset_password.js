const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

async function main() {
  const email = process.argv[2] || 'admin@canvacafe.com';
  const newPassword = process.argv[3] || 'password';

  console.log(`Resetting password for ${email} to "${newPassword}"...`);

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
    const result = await sql`
      UPDATE auth.users
      SET encrypted_password = crypt(${newPassword}, gen_salt('bf', 10)),
          updated_at = NOW()
      WHERE email = ${email}
      RETURNING id, email;
    `;

    if (result.length > 0) {
      console.log(`✅ Successfully reset password for ${email}!`);
      console.log(`New password: "${newPassword}"`);
    } else {
      console.log(`❌ No user found in auth.users with email "${email}"`);
    }
  } catch (err) {
    console.error("❌ SQL Update failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
