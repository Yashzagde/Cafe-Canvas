// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBuckets() {
  console.log('Initializing themes and logos buckets...');
  
  const themesResult = await supabase.storage.createBucket('themes', {
    public: true,
  });
  
  if (themesResult.error) {
    console.log('Themes bucket setup status:', themesResult.error.message);
  } else {
    console.log('Themes bucket created successfully!');
  }
  
  const logosResult = await supabase.storage.createBucket('logos', {
    public: true,
  });
  
  if (logosResult.error) {
    console.log('Logos bucket setup status:', logosResult.error.message);
  } else {
    console.log('Logos bucket created successfully!');
  }
  
  console.log('Buckets setup completed.');
}

createBuckets();
