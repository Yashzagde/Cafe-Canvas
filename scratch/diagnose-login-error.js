const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';
const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("=== Diagnosing Super Admin Query ===");
  try {
    // Step 1: Query users table for yashzagde01@gmail.com
    console.log("\n1. Querying users table...");
    const userRes = await admin
      .from('users')
      .select('id')
      .eq('email', 'yashzagde01@gmail.com')
      .single();
    
    console.log("User Query Result:", JSON.stringify(userRes, null, 2));

    if (userRes.error) {
      console.log("Error querying users table!");
      return;
    }

    const userId = userRes.data.id;
    console.log(`Found User ID: ${userId}`);

    // Step 2: Query super_admin_users table
    console.log("\n2. Querying super_admin_users table...");
    const superAdminRes = await admin
      .from('super_admin_users')
      .select('id, role')
      .eq('id', userId)
      .single();
    
    console.log("Super Admin Query Result:", JSON.stringify(superAdminRes, null, 2));

  } catch (error) {
    console.error("Diagnostic failed with exception:", error);
  }
}

run();
