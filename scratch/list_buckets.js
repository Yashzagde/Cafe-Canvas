const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const supabaseKey = 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function list() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log('Buckets:', data, 'Error:', error ? error.message : null);
}

list();
