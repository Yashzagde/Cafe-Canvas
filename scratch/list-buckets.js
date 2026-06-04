const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const supabaseKey = 'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listBuckets() {
  console.log('Fetching storage buckets...');
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Failed to list buckets:', error.message);
  } else {
    console.log('Available buckets:', data);
  }
}

listBuckets();
