const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function check() {
  try {
    console.log('Querying storefront_config for legacy columns...');
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'storefront_config';
    `;
    const columns = result.map(r => r.column_name);
    console.log('Available columns in storefront_config:', columns.join(', '));

    const legacyColumnsExist = columns.some(c => ['hero_title', 'hero_subtitle', 'hero_title_2', 'hero_subtitle_2'].includes(c));
    if (legacyColumnsExist) {
      console.log('Legacy columns exist in schema! Fetching rows...');
      const rows = await sql`
        SELECT tenant_id, hero_title, hero_subtitle, hero_title_2, hero_subtitle_2
        FROM storefront_config
        WHERE hero_title IS NOT NULL
           OR hero_title_2 IS NOT NULL;
      `;
      console.log(`Found ${rows.length} rows with legacy hero titles/subtitles data:`);
      console.log(JSON.stringify(rows, null, 2));
    } else {
      console.log('Legacy columns (hero_title, etc.) do NOT exist in the storefront_config table (they have been dropped).');
    }
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await sql.end();
  }
}

check();
