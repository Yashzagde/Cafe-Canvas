const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';
const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const adminId = 'a0000000-0000-0000-0000-000000000099';
const email = 'yashzagde01@gmail.com';
const password = 'yashz562';

async function run() {
  console.log("=== Re-creating Super Admin via Auth Admin API ===");
  try {
    // 1. Delete existing users to ensure clean slate
    console.log("\nDeleting existing super admin records if they exist...");
    
    // Delete from public tables first (since they foreign key reference auth.users in some schemas, or vice versa)
    await admin.from('super_admin_passkeys').delete().eq('user_id', adminId);
    await admin.from('super_admin_sessions').delete().eq('user_id', adminId);
    await admin.from('super_admin_users').delete().eq('id', adminId);
    await admin.from('users').delete().eq('id', adminId);

    // Delete from auth.users via Admin API
    const { error: deleteError } = await admin.auth.admin.deleteUser(adminId);
    if (deleteError) {
      console.log("Note on deleteUser:", deleteError.message);
    } else {
      console.log("Deleted user from auth.users successfully.");
    }

    // 2. Create the user properly via Supabase Auth Admin API
    console.log("\nCreating user in auth.users via admin.auth.admin.createUser...");
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      id: adminId,
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { name: "Yash Zagde" }
    });

    if (createError) {
      console.error("Failed to create auth user:", createError);
      return;
    }
    console.log("Auth User Created:", userData.user.id);

    // 3. Link user to public.users (Profile)
    console.log("\nLinking to public.users...");
    const { error: linkUserError } = await admin.from('users').insert({
      id: adminId,
      name: 'Yash Zagde',
      email: email,
      role: 'owner',
      active: true
    });
    if (linkUserError) {
      console.error("Failed to insert into public.users:", linkUserError);
      return;
    }
    console.log("Inserted into public.users.");

    // 4. Link user to public.super_admin_users (Super Admin role)
    console.log("\nLinking to public.super_admin_users...");
    const { error: linkSuperError } = await admin.from('super_admin_users').insert({
      id: adminId,
      role: 'platform_owner'
    });
    if (linkSuperError) {
      console.error("Failed to insert into public.super_admin_users:", linkSuperError);
      return;
    }
    console.log("Inserted into public.super_admin_users.");

    console.log("\n=== Success! Admin account recreated cleanly! ===");

  } catch (error) {
    console.error("Script failed with exception:", error);
  }
}

run();
