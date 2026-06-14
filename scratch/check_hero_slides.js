const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL || '';
const sql = postgres(dbUrl, { ssl: 'require', max: 1, connect_timeout: 30 });

async function main() {
  try {
    console.log("Checking if old hero columns exist and contain data...");
    
    // Check if columns exist
    const columnsCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'storefront_config' 
        AND column_name IN ('hero_title', 'hero_subtitle', 'hero_title_2', 'hero_subtitle_2', 'hero_title_3', 'hero_subtitle_3');
    `;
    
    if (columnsCheck.length === 0) {
      console.log("Old hero columns do not exist in storefront_config (already dropped). No data loss check needed.");
      return;
    }
    
    console.log(`Found ${columnsCheck.length} old hero columns in storefront_config.`);

    // Check if there is data in these columns
    const rows = await sql`
      SELECT id, tenant_id, hero_title, hero_subtitle, hero_title_2, hero_subtitle_2, hero_title_3, hero_subtitle_3, hero_slides
      FROM public.storefront_config
      WHERE hero_title IS NOT NULL 
         OR hero_subtitle IS NOT NULL 
         OR hero_title_2 IS NOT NULL 
         OR hero_subtitle_2 IS NOT NULL 
         OR hero_title_3 IS NOT NULL 
         OR hero_subtitle_3 IS NOT NULL;
    `;

    if (rows.length === 0) {
      console.log("No rows have non-null values in the legacy hero columns. Safe to drop.");
      return;
    }

    console.log(`Found ${rows.length} rows with legacy hero text data. Patching JSONB hero_slides...`);

    for (const r of rows) {
      console.log(`Row ID: ${r.id}, Tenant ID: ${r.tenant_id}`);
      console.log(`  Slide 1: Title="${r.hero_title}", Subtitle="${r.hero_subtitle}"`);
      console.log(`  Slide 2: Title="${r.hero_title_2}", Subtitle="${r.hero_subtitle_2}"`);
      console.log(`  Slide 3: Title="${r.hero_title_3}", Subtitle="${r.hero_subtitle_3}"`);
    }

    // Run the patch query
    const patchResult = await sql`
      UPDATE public.storefront_config
      SET hero_slides = (
        SELECT jsonb_agg(
          jsonb_build_object(
            'image_url', slide->>'image_url',
            'title',     CASE idx
                           WHEN 1 THEN hero_title
                           WHEN 2 THEN hero_title_2
                           WHEN 3 THEN hero_title_3
                         END,
            'subtitle',  CASE idx
                           WHEN 1 THEN hero_subtitle
                           WHEN 2 THEN hero_subtitle_2
                           WHEN 3 THEN hero_subtitle_3
                         END
          )
        )
        FROM jsonb_array_elements(hero_slides) WITH ORDINALITY AS t(slide, idx)
      )
      WHERE hero_title IS NOT NULL 
         OR hero_title_2 IS NOT NULL 
         OR hero_title_3 IS NOT NULL 
         OR hero_subtitle IS NOT NULL 
         OR hero_subtitle_2 IS NOT NULL 
         OR hero_subtitle_3 IS NOT NULL
      RETURNING id, hero_slides;
    `;

    console.log(`✓ Patched ${patchResult.length} rows successfully.`);
    console.log("Sample patched JSONB:", JSON.stringify(patchResult[0]?.hero_slides, null, 2));

  } catch (err) {
    console.error("Error checking or patching hero columns:", err.message);
  } finally {
    await sql.end();
  }
}

main();
