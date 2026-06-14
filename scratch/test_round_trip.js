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

    // 1. Load config
    console.log("\n[Step 1] Loading storefront_config...");
    const { data: originalConfig, error: fetchError } = await supabase
      .from('storefront_config')
      .select('*')
      .eq('tenant_id', 'c1000000-0000-0000-0000-000000000001')
      .single();

    if (fetchError) {
      console.error("❌ Fetch failed:", fetchError.message);
      return;
    }

    console.log("✓ Loaded config hero_slides from database:", JSON.stringify(originalConfig.hero_slides, null, 2));

    // Map DB to UI Config
    const mapDbConfigToUiConfig = (data) => {
      if (!data) return null;
      const slides = data.hero_slides || [];
      return {
        ...data,
        hero_image_url: slides[0]?.image_url || null,
        hero_image_url_2: slides[1]?.image_url || null,
        hero_image_url_3: slides[2]?.image_url || null,
        hero_title: slides[0]?.title || null,
        hero_subtitle: slides[0]?.subtitle || null,
        hero_title_2: slides[1]?.title || null,
        hero_subtitle_2: slides[1]?.subtitle || null,
        hero_title_3: slides[2]?.title || null,
        hero_subtitle_3: slides[2]?.subtitle || null,
      };
    };

    const uiConfig = mapDbConfigToUiConfig(originalConfig);
    console.log("Mapped UI config local fields:");
    console.log(`- Slide 1 URL: ${uiConfig.hero_image_url}`);
    console.log(`- Slide 1 Title: ${uiConfig.hero_title}`);
    console.log(`- Slide 2 URL: ${uiConfig.hero_image_url_2}`);
    console.log(`- Slide 2 Title: ${uiConfig.hero_title_2}`);

    // 2. Modify slide 1 title in UI config
    console.log("\n[Step 2] Modifying title and subtitle of slide 1...");
    uiConfig.hero_title = "Delicious Handcrafted Chai & Snacks";
    uiConfig.hero_subtitle = "Made fresh, served piping hot at India's favorite tea point.";

    // Map UI to DB payload
    const mapUiConfigToDbPayload = (config) => {
      const slides = [];
      
      const slide1 = {
        image_url: config.hero_image_url || null,
        title: config.hero_title || null,
        subtitle: config.hero_subtitle || null,
      };
      if (slide1.image_url || slide1.title || slide1.subtitle) {
        slides.push(slide1);
      }

      const slide2 = {
        image_url: config.hero_image_url_2 || null,
        title: config.hero_title_2 || null,
        subtitle: config.hero_subtitle_2 || null,
      };
      if (slide2.image_url || slide2.title || slide2.subtitle) {
        slides.push(slide2);
      }

      const slide3 = {
        image_url: config.hero_image_url_3 || null,
        title: config.hero_title_3 || null,
        subtitle: config.hero_subtitle_3 || null,
      };
      if (slide3.image_url || slide3.title || slide3.subtitle) {
        slides.push(slide3);
      }

      const allowedKeys = [
        'theme_id', 'primary_color', 'accent_color', 'font_heading', 'font_body',
        'banner_text', 'show_prices', 'allow_orders', 'show_blog', 'show_reviews',
        'show_instagram', 'show_story', 'logo_url', 'footer_description', 'footer_hours',
        'footer_address', 'footer_phone', 'footer_email', 'about_title', 'about_text',
        'about_image_url', 'hero_slides'
      ];

      const configWithSlides = {
        ...config,
        hero_slides: slides
      };

      const allowedData = {};
      for (const key of allowedKeys) {
        if (key in configWithSlides) {
          allowedData[key] = configWithSlides[key];
        }
      }
      return allowedData;
    };

    const dbPayload = mapUiConfigToDbPayload(uiConfig);
    console.log("Constructed DB payload to save:", JSON.stringify(dbPayload, null, 2));

    // 3. Save to database
    console.log("\n[Step 3] Updating storefront_config in database...");
    const { data: updatedConfigRow, error: updateError } = await supabase
      .from('storefront_config')
      .update(dbPayload)
      .eq('id', originalConfig.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Update failed:", updateError.message);
      return;
    }

    console.log("✓ Update successful!");

    // 4. Verify JSON content in database
    console.log("\n[Step 4] Verifying updated hero_slides in database...");
    console.log("Updated hero_slides:", JSON.stringify(updatedConfigRow.hero_slides, null, 2));
    
    const firstSlide = updatedConfigRow.hero_slides?.[0];
    if (
      firstSlide &&
      firstSlide.title === "Delicious Handcrafted Chai & Snacks" &&
      firstSlide.subtitle === "Made fresh, served piping hot at India's favorite tea point."
    ) {
      console.log("🎉 SUCCESS: Database JSON contains the edited title and subtitle!");
    } else {
      console.error("❌ FAILED: Database JSON does not match expectations.");
    }

    // 5. Reload the editor (remap from DB)
    console.log("\n[Step 5] Reloading and remapping...");
    const reloadedUiConfig = mapDbConfigToUiConfig(updatedConfigRow);
    if (
      reloadedUiConfig.hero_title === "Delicious Handcrafted Chai & Snacks" &&
      reloadedUiConfig.hero_subtitle === "Made fresh, served piping hot at India's favorite tea point."
    ) {
      console.log("🎉 SUCCESS: Reloaded UI config fields correctly repopulate!");
    } else {
      console.error("❌ FAILED: Reloaded UI config fields do not match.");
    }

    // 6. Restore original configuration
    console.log("\n[Step 6] Restoring original hero_slides to database...");
    const { error: restoreError } = await supabase
      .from('storefront_config')
      .update({ hero_slides: originalConfig.hero_slides })
      .eq('id', originalConfig.id);

    if (restoreError) {
      console.error("❌ Restore failed:", restoreError.message);
    } else {
      console.log("✓ Original storefront_config values restored.");
    }

  } catch (err) {
    console.error("Unexpected error:", err.message);
  }
}

main();
