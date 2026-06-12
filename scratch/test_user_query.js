const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  try {
    console.log("Signing in as yashzagde01@gmail.com...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'yashzagde01@gmail.com',
      password: 'password' // or whatever the password is
    });

    if (authError) {
      // Try with pin
      console.log("Failed to sign in with password, trying pin '1234'...");
      const { data: authDataPin, error: authErrorPin } = await supabase.auth.signInWithPassword({
        email: 'yashzagde01@gmail.com',
        password: '1234'
      });
      if (authErrorPin) {
        throw authErrorPin;
      }
      console.log("Logged in successfully via PIN!");
    } else {
      console.log("Logged in successfully via password!");
    }

    const { data: { user } } = await supabase.auth.getUser();
    console.log("Logged in Auth User ID:", user.id);

    console.log("Querying public.users view...");
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id);

    if (usersError) {
      console.error("Users View Query Error:", usersError);
    } else {
      console.log("Users View Query Result:", users);
    }

    console.log("Querying public.staff_accounts...");
    const { data: staff, error: staffError } = await supabase
      .from('staff_accounts')
      .select('*')
      .eq('auth_user_id', user.id);

    if (staffError) {
      console.error("Staff Accounts Query Error:", staffError);
    } else {
      console.log("Staff Accounts Query Result:", staff);
    }

  } catch (err) {
    console.error("Main execution error:", err);
  }
}

main();
