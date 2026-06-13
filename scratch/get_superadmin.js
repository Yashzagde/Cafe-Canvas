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
    console.error("DATABASE_URL is missing.");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    const superadmins = await sql`
      SELECT sa.id, u.email, u.name, sa.role 
      FROM public.super_admin_users sa
      LEFT JOIN public.users u ON u.id = sa.id
    `;
    console.log("Super Admin Users in DB:", JSON.stringify(superadmins, null, 2));
  } catch (err) {
    console.error("Error querying superadmins:", err.message);
  } finally {
    await sql.end();
  }
}
main();
