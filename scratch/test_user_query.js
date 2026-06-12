const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log("Signing in as yashzagde01@gmail.com...");
  const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'yashzagde01@gmail.com',
    password: 'yashz562'
  });

  if (signInError) {
    console.error("❌ Sign in failed:", signInError);
    return;
  }

  console.log("✓ Signed in successfully. User ID:", session.user.id);
  console.log("User metadata:", session.user.user_metadata);

  // Now perform the query from page.tsx
  console.log("Querying public.users...");
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profileError) {
    console.error("❌ Profile query failed:", profileError);
  } else {
    console.log("✓ Profile query succeeded:", profile);
  }
}

main();
