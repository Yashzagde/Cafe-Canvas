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
    console.log("Testing safe nested jsonb_set...");
    const res = await sql`
      DO $$
      DECLARE
        event jsonb := '{"user_id": "a0000000-0000-0000-0000-000000000099"}'::jsonb;
      BEGIN
        IF (event->'claims') IS NULL OR jsonb_typeof(event->'claims') != 'object' THEN
          event := jsonb_set(event, '{claims}', '{}'::jsonb);
        END IF;

        IF (event->'claims'->'app_metadata') IS NULL OR jsonb_typeof(event->'claims'->'app_metadata') != 'object' THEN
          event := jsonb_set(event, '{claims,app_metadata}', '{}'::jsonb);
        END IF;

        event := jsonb_set(event, '{claims,app_metadata,tenant_id}', '"c1000000-0000-0000-0000-000000000001"'::jsonb);
        RAISE NOTICE 'Safe Output: %', event;
      END;
      $$;
    `;
    console.log("Output: Success!");
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
