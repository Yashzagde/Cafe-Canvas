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
    console.log("Signing in with email: yashzagde01@gmail.com...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'yashzagde01@gmail.com',
      password: 'yashz562'
    });
    
    if (error) {
      console.error("❌ Sign in failed:", error.message);
      return;
    }
    
    console.log("✓ Sign in successful!");
    const tokenParts = data.session.access_token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log("\n--- JWT App Metadata Claims ---");
      console.log(JSON.stringify(payload.app_metadata, null, 2));
      console.log("--------------------------------\n");
    }
  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

main();
