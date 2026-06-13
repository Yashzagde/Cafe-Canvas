const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.error("Missing URL or Anon key in .env.local");
    return;
  }
  
  const supabase = createClient(url, anonKey);
  try {
    const email = `testuser-${Date.now()}@example.com`;
    const password = "CompliantPassword123!";

    console.log(`Signing up new user: ${email}...`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      console.error("❌ Sign up failed:", signUpError.message);
      return;
    }

    console.log("✓ Sign up successful! User ID:", signUpData.user.id);

    console.log(`Signing in as: ${email}...`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error("❌ Sign in failed:", signInError.message);
    } else {
      console.log("✓ Sign in successful! JWT app_metadata:", signInData.session.user.app_metadata);
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

main();
