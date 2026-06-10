const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'yashzagde01@gmail.com',
      password: 'yashz562'
    });
    
    if (authError) {
      console.error("❌ Sign in failed:", authError.message);
      return;
    }
    
    console.log("✓ Sign in successful!");

    const filePath = 'test-upload-file.txt';
    const fileContent = 'Hello World! Testing storage RLS policies.';
    
    console.log(`Uploading test file to logos bucket as '${filePath}'...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, Buffer.from(fileContent), {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError);
      return;
    }

    console.log("✓ Upload successful!", uploadData);

    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath);
    console.log("✓ Public URL of uploaded file:", publicUrl);

    // Clean up
    console.log("Cleaning up... Deleting test file...");
    const { error: deleteError } = await supabase.storage
      .from('logos')
      .remove([filePath]);

    if (deleteError) {
      console.error("❌ Cleanup failed:", deleteError.message);
    } else {
      console.log("✓ Cleanup successful (file deleted).");
    }

  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

main();
