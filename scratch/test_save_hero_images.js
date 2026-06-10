const { createClient } = require('@supabase/supabase-js');
const path = require('path');
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

    // Fetch existing storefront config
    console.log("Fetching storefront_config...");
    const { data: config, error: fetchError } = await supabase
      .from('storefront_config')
      .select('*')
      .eq('tenant_id', 'c1000000-0000-0000-0000-000000000001')
      .single();

    if (fetchError) {
      console.error("❌ Fetch failed:", fetchError.message);
      return;
    }

    console.log("✓ Current config row:", config);

    // Update hero_image_url_2 and hero_image_url_3
    const testUrl2 = 'https://example.com/test-hero-2.jpg';
    const testUrl3 = 'https://example.com/test-hero-3.jpg';

    console.log("Updating hero_image_url_2 and hero_image_url_3...");
    const { data: updateData, error: updateError } = await supabase
      .from('storefront_config')
      .update({
        hero_image_url_2: testUrl2,
        hero_image_url_3: testUrl3
      })
      .eq('id', config.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Update failed:", updateError.message);
      return;
    }

    console.log("✓ Update successful!", updateData);

    // Restore to original (null/empty)
    console.log("Restoring original config values...");
    await supabase
      .from('storefront_config')
      .update({
        hero_image_url_2: config.hero_image_url_2,
        hero_image_url_3: config.hero_image_url_3
      })
      .eq('id', config.id);
    
    console.log("✓ Original values restored.");

  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

main();
