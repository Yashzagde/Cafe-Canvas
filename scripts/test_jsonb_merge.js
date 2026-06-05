const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is missing.");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    console.log("Testing JSONB merge (||) query...");
    const res = await sql`
      SELECT 
        '{"user_id": "a0000000-0000-0000-0000-000000000099"}'::jsonb || 
        jsonb_build_object(
          'claims', COALESCE(NULL::jsonb, '{}'::jsonb) || jsonb_build_object(
            'app_metadata', COALESCE(NULL::jsonb, '{}'::jsonb) || jsonb_build_object(
              'tenant_id', 'c1000000-0000-0000-0000-000000000001'::uuid,
              'location_id', 'd1000000-0000-0000-0000-000000000001'::uuid,
              'role', 'manager'
            )
          )
        ) AS output;
    `;
    console.log("Safe Merge Output:", JSON.stringify(res[0].output, null, 2));
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
