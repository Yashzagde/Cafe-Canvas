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
    // 1. Fetch user ID from auth.users
    const users = await sql`
      SELECT id FROM auth.users WHERE email = 'admin@cafecanvas.com';
    `;
    console.log("Auth user found:", users);

    if (users.length > 0) {
      const userId = users[0].id;
      
      // 2. Delete any bad profile if it exists (should not exist due to failure, but let's check)
      await sql`DELETE FROM public.users WHERE id = ${userId}`;

      // 3. Create profile in public.users with valid role 'owner'
      console.log("Creating profile with role 'owner' in public.users...");
      const insertProfile = await sql`
        INSERT INTO public.users (id, tenant_id, branch_id, name, email, role, active)
        VALUES (
          ${userId},
          'a0000000-0000-0000-0000-000000000001',
          'ab000000-0000-0000-0000-000000000001',
          'yash zagde',
          'admin@cafecanvas.com',
          'owner',
          true
        )
        RETURNING *;
      `;
      console.log("Profile created:", insertProfile);
    }
    
    console.log("\n✓ User 'admin@cafecanvas.com' database profile inserted successfully!");
  } catch (error) {
    console.error("Failed to insert user profile:", error.message || error);
  } finally {
    await sql.end();
  }
}

run();
