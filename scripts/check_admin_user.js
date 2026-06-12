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
  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    const emailToCheck = 'yashzagde01@gmail.com';
    console.log(`Checking public.users and public.staff_accounts for: ${emailToCheck}...\n`);

    const users = await sql`
      SELECT id, name, email, role, branch_id, tenant_id
      FROM public.users
      WHERE email = ${emailToCheck}
    `;

    console.log("public.users query result:");
    console.log(users);

    const authUser = await sql`
      SELECT id, email, raw_user_meta_data, raw_app_meta_data
      FROM auth.users
      WHERE email = ${emailToCheck}
    `;

    console.log("\nauth.users query result:");
    console.log(authUser);

    const staff = await sql`
      SELECT id, auth_user_id, email, role, full_name, is_active, tenant_id
      FROM public.staff_accounts
      WHERE email = ${emailToCheck}
    `;

    console.log("\npublic.staff_accounts query result:");
    console.log(staff);

  } catch (err) {
    console.error("SQL Query failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
