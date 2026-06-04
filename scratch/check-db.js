const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in frontend/.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', supabaseUrl);

  try {
    // 1. Fetch tenants
    const { data: tenants, error: tErr } = await supabase.from('tenants').select('*');
    if (tErr) throw tErr;
    console.log(`\n--- TENANTS (${tenants.length}) ---`);
    tenants.forEach(t => {
      console.log(`- ID: ${t.id} | Name: ${t.name} | Slug: ${t.slug} | Email: ${t.email}`);
    });

    // 2. Fetch staff accounts
    const { data: staff, error: sErr } = await supabase.from('staff_accounts').select('*');
    if (sErr) throw sErr;
    console.log(`\n--- STAFF ACCOUNTS (${staff.length}) ---`);
    staff.forEach(s => {
      console.log(`- ID: ${s.id} | Name: ${s.full_name} | Role: ${s.role} | Email: ${s.email} | Tenant ID: ${s.tenant_id} | Auth ID: ${s.auth_user_id}`);
    });

    // 3. Fetch users from auth.users (requires service_role)
    const { data: { users }, error: uErr } = await supabase.auth.admin.listUsers();
    if (uErr) throw uErr;
    console.log(`\n--- AUTH USERS (${users.length}) ---`);
    users.forEach(u => {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Created At: ${u.created_at}`);
    });

  } catch (err) {
    console.error('Database query error:', err.message || err);
  }
}

main();
