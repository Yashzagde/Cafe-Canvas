const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  try {
    // Attempting to query tables with branch_id
    const { data: data1, error: error1 } = await supabase
      .from('tables')
      .select('*')
      .eq('branch_id', 'd1000000-0000-0000-0000-000000000001');

    if (error1) {
      console.log('Query with branch_id failed:', error1.message);
    } else {
      console.log('Query with branch_id succeeded:', data1.length, 'rows');
    }

    // Attempting to query tables with location_id
    const { data: data2, error: error2 } = await supabase
      .from('tables')
      .select('*')
      .eq('location_id', 'd1000000-0000-0000-0000-000000000001');

    if (error2) {
      console.log('Query with location_id failed:', error2.message);
    } else {
      console.log('Query with location_id succeeded:', data2.length, 'rows');
    }
  } catch (err) {
    console.error('Unhandled error:', err);
  }
}

run();
