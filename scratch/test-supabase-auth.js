const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const anonKey = 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU';

const supabase = createClient(supabaseUrl, anonKey);

async function run() {
  console.log("=== Testing Supabase Auth with key ===");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'owner@aether-cafe.com',
      password: 'some-password-here'
    });
    console.log("Auth Response Data:", data);
    console.log("Auth Response Error:", error);
  } catch (err) {
    console.error("Exception during auth:", err);
  }
}

run();
