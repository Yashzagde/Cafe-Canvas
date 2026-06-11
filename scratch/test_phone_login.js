const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase config is missing in environment!");
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

async function verifyLogin() {
  const phoneInput = '9876500001';
  const email = `${phoneInput}@cafecanvas.bar`;
  const password = 'staffpassword123';

  console.log(`Attempting to sign in with reconstructed email: ${email}...`);
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log("✅ Login successful!");
    console.log("User details:");
    console.log(`- ID:       ${data.user.id}`);
    console.log(`- Email:    ${data.user.email}`);
    console.log(`- Phone:    ${data.user.phone}`);
    console.log(`- Role:     ${data.user.app_metadata.role}`);
    console.log(`- Tenant:   ${data.user.app_metadata.tenant_id}`);
    console.log(`- Branch:   ${data.user.app_metadata.branch_id}`);
  } catch (err) {
    console.error("❌ Login failed:", err.message || err);
  }
}

verifyLogin();
