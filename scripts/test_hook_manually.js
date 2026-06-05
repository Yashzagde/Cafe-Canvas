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
    console.log("Simulating authenticated role execution of inject_tenant_claims...");
    const result = await sql`
      BEGIN;
      SET ROLE authenticated;
      SELECT public.inject_tenant_claims(
        '{"user_id": "a0000000-0000-0000-0000-000000000099", "claims": {"app_metadata": {}}}'::jsonb
      ) AS output;
      ROLLBACK;
    `;
    console.log("Output under authenticated role:", result);
  } catch (err) {
    console.error("❌ Execution failed under authenticated role:", err.message);
  } finally {
    await sql.end();
  }
}

main();
