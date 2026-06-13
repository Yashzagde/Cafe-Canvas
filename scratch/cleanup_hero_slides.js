const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL || '';
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    console.log('Cleaning up hero_slides arrays...');
    
    // First, let's clean up any arrays that consist entirely of nulls or empty objects
    await sql`
      UPDATE storefront_config
      SET hero_slides = '[]'::jsonb
      WHERE hero_slides = '[null, null, null]'::jsonb
         OR hero_slides = '[null, null]'::jsonb
         OR hero_slides = '[null]'::jsonb
         OR hero_slides IS NULL;
    `;
    
    // Let's also check if there are any remaining null values inside the arrays and remove them
    // E.g., if hero_slides has [ {image_url: ...}, null, null ] we can filter it to just [ {image_url: ...} ]
    const configs = await sql`SELECT id, hero_slides FROM storefront_config;`;
    for (const config of configs) {
      if (Array.isArray(config.hero_slides)) {
        const cleanedSlides = config.hero_slides.filter(slide => slide !== null && typeof slide === 'object' && Object.keys(slide).length > 0);
        if (JSON.stringify(config.hero_slides) !== JSON.stringify(cleanedSlides)) {
          await sql`
            UPDATE storefront_config
            SET hero_slides = ${JSON.stringify(cleanedSlides)}::jsonb
            WHERE id = ${config.id};
          `;
        }
      }
    }
    
    console.log('Successfully cleaned up storefront_config.hero_slides data!');
    
    const finalConfigs = await sql`SELECT id, tenant_id, hero_slides FROM storefront_config;`;
    console.log(JSON.stringify(finalConfigs, null, 2));
  } catch (err) {
    console.error('Error cleaning up hero_slides:', err instanceof Error ? err.message : String(err));
  } finally {
    await sql.end();
  }
}

main();
