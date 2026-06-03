const postgres = require('postgres');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL.replace('[YOUR-PASSWORD]', 'XASzdcFrmbyXuGOn');

const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 10,
});

async function run() {
  console.log("Connecting to Supabase database...");
  try {
    // 1. Update auth.users to confirm email
    const result = await sql`
      UPDATE auth.users 
      SET confirmed_at = NOW(), 
          email_confirmed_at = NOW(), 
          updated_at = NOW()
      WHERE email = 'admin@cafecanvas.com'
      RETURNING id, email, email_confirmed_at;
    `;
    console.log("Update user result:", result);

    // 2. Also ensure that the profile exists in public.users
    const profile = await sql`
      SELECT id, role, tenant_id, branch_id FROM public.users 
      WHERE email = 'admin@cafecanvas.com';
    `;
    console.log("Current user profile in public.users:", profile);

    if (profile.length === 0 && result.length > 0) {
      console.log("Profile missing, creating profile in public.users...");
      const insertProfile = await sql`
        INSERT INTO public.users (id, tenant_id, branch_id, name, email, role, active)
        VALUES (
          ${result[0].id},
          'a0000000-0000-0000-0000-000000000001',
          'ab000000-0000-0000-0000-000000000001',
          'yash zagde',
          'admin@cafecanvas.com',
          'admin',
          true
        )
        RETURNING *;
      `;
      console.log("Profile created:", insertProfile);
    }
    
    console.log("\n✓ User 'admin@cafecanvas.com' confirmed and profile synced successfully!");
  } catch (error) {
    console.error("Failed to confirm user:", error.message || error);
  } finally {
    await sql.end();
  }
}

run();
