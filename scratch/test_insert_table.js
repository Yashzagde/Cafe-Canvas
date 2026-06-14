const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  try {
    const { data, error } = await supabase
      .from('tables')
      .insert({
        name: 'Test Temp Table',
        capacity: 4,
        section: 'Indoor',
        shape: 'square',
        status: 'available',
        floor_x: 10,
        floor_y: 10,
        tenant_id: 'c1000000-0000-0000-0000-000000000001',
        branch_id: 'd1000000-0000-0000-0000-000000000001' // branch_id instead of location_id
      })
      .select();

    if (error) {
      console.log('Insert with branch_id failed:', error.message);
    } else {
      console.log('Insert with branch_id succeeded:', data);
    }
  } catch (err) {
    console.error('Unhandled error:', err);
  }
}

run();
