const { createClient } = require('@supabase/supabase-js');

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';
const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  console.log("=== Checking staff_accounts ===");
  try {
    const { data, error } = await admin.from('staff_accounts').select('id, full_name, email, role');
    if (error) {
      console.error("Error fetching staff:", error);
      return;
    }
    console.log(`Found ${data.length} staff accounts.`);
    if (data.length > 0) {
      console.log("First 3 staff:");
      console.log(data.slice(0, 3));
    }
  } catch (err) {
    console.error("Exception checking staff:", err);
  }
}

run();
