const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oeringgdbxmmihgvuyfa.supabase.co',
  'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU'
);

async function run() {
  console.log("Testing signUp with admin@cafecanvas.com...");
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@cafecanvas.com',
    password: 'password123'
  });
  if (error) {
    console.error("SignUp failed:", error.message);
  } else {
    console.log("SignUp success!", data);
  }
}

run();
