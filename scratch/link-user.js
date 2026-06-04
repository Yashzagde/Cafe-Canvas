const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../frontend/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const email = 'yashzagde01@gmail.com';
  const authUserId = '2e38ef3e-6f60-479b-a2e1-15f3d0e21eab';
  const tenantId = 'aaaaaaaa-0000-0000-0000-000000000001';

  console.log(`Linking ${email} to Tenant ID: ${tenantId}...`);

  try {
    // 1. Check if a staff account already exists for this email
    const { data: existingStaff } = await supabase
      .from('staff_accounts')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingStaff) {
      console.log('Updating existing staff account...');
      const { error } = await supabase
        .from('staff_accounts')
        .update({
          auth_user_id: authUserId,
          role: 'manager',
          is_active: true
        })
        .eq('email', email);
      if (error) throw error;
    } else {
      console.log('Creating new staff account...');
      const { error } = await supabase
        .from('staff_accounts')
        .insert({
          tenant_id: tenantId,
          full_name: 'Yash Zagde',
          email: email,
          role: 'manager',
          auth_user_id: authUserId,
          pin: '1234',
          is_active: true
        });
      if (error) throw error;
    }

    console.log('SUCCESS! User linked successfully.');
  } catch (err) {
    console.error('Error linking user:', err.message || err);
  }
}

main();
