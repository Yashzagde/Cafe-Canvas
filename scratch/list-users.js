const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';
const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("=== Listing Users ===");
  try {
    const { data: { users }, error } = await admin.auth.admin.listUsers();
    if (error) {
      console.error("Error listing users:", error);
      return;
    }
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Email: ${u.email}, Confirmed: ${u.email_confirmed_at}`);
    });
  } catch (err) {
    console.error("Exception listing users:", err);
  }
}

run();
