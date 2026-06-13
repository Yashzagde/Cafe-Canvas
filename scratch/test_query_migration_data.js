const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
const sql = postgres(dbUrl, { ssl: 'require', max: 1 });

async function main() {
  try {
    console.log('--- Querying offer_codes ---');
    const offerCodes = await sql`SELECT * FROM offer_codes LIMIT 5;`;
    console.log(offerCodes);

    console.log('\n--- Querying blog_posts (slug and is_published columns) ---');
    const blogPosts = await sql`SELECT id, title, slug, is_published FROM blog_posts LIMIT 5;`;
    console.log(blogPosts);

    console.log('\n--- Querying storefront_config (hero_slides JSONB) ---');
    const config = await sql`SELECT id, tenant_id, hero_slides FROM storefront_config LIMIT 5;`;
    console.log(JSON.stringify(config, null, 2));

    console.log('\n--- Querying customer_otp_sessions (otp_hash column) ---');
    const otpSessions = await sql`SELECT id, phone, otp_hash, attempts FROM customer_otp_sessions LIMIT 5;`;
    console.log(otpSessions);
  } catch (err) {
    console.error('❌ Error querying migrated data:', err.message);
  } finally {
    await sql.end();
  }
}

main();
