const postgres = require('postgres');

const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';

const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 10,
});

async function run() {
  console.log("=== Deleting Corrupt User from auth.users via Direct SQL ===");
  try {
    // 1. Delete references in public tables
    console.log("Deleting referencing records in public schema...");
    await sql`DELETE FROM public.super_admin_passkeys WHERE user_id = 'a0000000-0000-0000-0000-000000000099'`;
    await sql`DELETE FROM public.super_admin_sessions WHERE user_id = 'a0000000-0000-0000-0000-000000000099'`;
    await sql`DELETE FROM public.super_admin_users WHERE id = 'a0000000-0000-0000-0000-000000000099'`;
    await sql`DELETE FROM public.users WHERE id = 'a0000000-0000-0000-0000-000000000099'`;

    // 2. Delete corrupt row in auth.users directly
    console.log("Deleting user from auth.users table directly...");
    const deletedUsers = await sql`
      DELETE FROM auth.users 
      WHERE email = 'yashzagde01@gmail.com' OR id = 'a0000000-0000-0000-0000-000000000099'
      RETURNING id, email;
    `;
    console.log("Deleted auth.users records:", deletedUsers);

    // 3. Delete from auth.identities as well (sometimes references exist there)
    console.log("Deleting user from auth.identities table...");
    const deletedIdentities = await sql`
      DELETE FROM auth.identities 
      WHERE user_id = 'a0000000-0000-0000-0000-000000000099'
      RETURNING id, provider;
    `;
    console.log("Deleted auth.identities records:", deletedIdentities);

    console.log("\n=== Direct SQL Cleanup Completed successfully! ===");
  } catch (error) {
    console.error("SQL cleanup failed:", error.message || error);
  } finally {
    await sql.end();
  }
}

run();
