// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function upload() {
  const filePath = path.join(__dirname, '..', 'desktop', 'dist-desktop', 'CafeCanvas Store Admin Setup 1.0.0.exe');
  const fileBuffer = fs.readFileSync(filePath);

  console.log('Uploading file to themes bucket...');
  const { data, error } = await supabase.storage
    .from('themes')
    .upload('CafeCanvas-Store-Admin-Setup-1.0.0.exe', fileBuffer, {
      contentType: 'application/octet-stream',
      upsert: true
    });

  if (error) {
    console.error('Upload to themes failed:', error.message);
    console.log('Trying logos bucket...');
    const { data: dataLogos, error: errorLogos } = await supabase.storage
      .from('logos')
      .upload('CafeCanvas-Store-Admin-Setup-1.0.0.exe', fileBuffer, {
        contentType: 'application/octet-stream',
        upsert: true
      });
      
    if (errorLogos) {
      console.error('Upload to logos failed:', errorLogos.message);
    } else {
      console.log('Upload to logos succeeded! Public URL:', `${supabaseUrl}/storage/v1/object/public/logos/CafeCanvas-Store-Admin-Setup-1.0.0.exe`);
    }
  } else {
    console.log('Upload to themes succeeded! Public URL:', `${supabaseUrl}/storage/v1/object/public/themes/CafeCanvas-Store-Admin-Setup-1.0.0.exe`);
  }
}

upload();
