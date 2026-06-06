const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Testing Supabase JS client over HTTP PostgREST...");
  try {
    const { data, error } = await supabase.from('tenants').select('*').limit(1);
    if (error) {
      console.error("❌ Supabase JS query failed:", error);
    } else {
      console.log("✓ Supabase JS query succeeded:", data);
    }
  } catch (err) {
    console.error("❌ Caught exception:", err);
  }
}
main();
