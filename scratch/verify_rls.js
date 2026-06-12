const postgres = require('postgres');

const sql = postgres({
  host: 'db.oeringgdbxmmihgvuyfa.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'XASzdcFrmbyXuGOn',
  ssl: 'require',
  max: 1,
  connect_timeout: 30
});

async function run() {
  console.log("=================================================");
  console.log(" Row-Level Security (RLS) Verification Script   ");
  console.log("=================================================\n");

  const tenantId = 'c1000000-0000-0000-0000-000000000001';

  try {
    // 1. Clean up and insert test payment integration using high-privilege connection (which bypasses RLS in migrations but we run under RLS simulation here)
    console.log("Cleaning old test integrations...");
    await sql`DELETE FROM payment_integrations WHERE tenant_id = ${tenantId}`;

    console.log("Inserting test payment integration config...");
    const [inserted] = await sql`
      INSERT INTO payment_integrations (tenant_id, provider, encrypted_config, is_active)
      VALUES (
        ${tenantId}, 
        'razorpay', 
        '{"key_id": "rzp_test_123", "key_secret": "SUPER_SECRET_HMAC_KEY"}'::jsonb, 
        true
      )
      RETURNING *
    `;
    console.log("✓ Inserted test config ID:", inserted.id);

    // 2. Test RLS as a Waiter (should be blocked)
    console.log("\nTesting SELECT as WAITER...");
    const waiterResult = await sql.begin(async (tx) => {
      // Set role to authenticated to enforce RLS
      await tx`SET ROLE authenticated`;
      // Mock Supabase JWT claims for waiter role
      await tx`
        SELECT set_config(
          'request.jwt.claims', 
          ${JSON.stringify({
            sub: '00000000-0000-0000-0000-000000000002',
            email: 'waiter@test.com',
            app_metadata: {
              tenant_id: tenantId,
              role: 'waiter'
            }
          })}, 
          true
        )
      `;
      // Run select
      const res = await tx`SELECT * FROM payment_integrations WHERE tenant_id = ${tenantId}`;
      await tx`RESET ROLE`;
      return res;
    });
    console.log("Waiter SELECT returned:", waiterResult.length, "rows.");
    if (waiterResult.length === 0) {
      console.log("✅ SUCCESS: Waiter was BLOCKED from reading payment secrets.");
    } else {
      console.error("❌ FAILURE: Waiter could read payment secrets!");
      process.exit(1);
    }

    // 3. Test RLS as a Manager (should be allowed)
    console.log("\nTesting SELECT as MANAGER...");
    const managerResult = await sql.begin(async (tx) => {
      // Set role to authenticated to enforce RLS
      await tx`SET ROLE authenticated`;
      // Mock Supabase JWT claims for manager role
      await tx`
        SELECT set_config(
          'request.jwt.claims', 
          ${JSON.stringify({
            sub: '00000000-0000-0000-0000-000000000001',
            email: 'yashzagde01@gmail.com',
            app_metadata: {
              tenant_id: tenantId,
              role: 'manager'
            }
          })}, 
          true
        )
      `;
      // Run select
      const res = await tx`SELECT * FROM payment_integrations WHERE tenant_id = ${tenantId}`;
      await tx`RESET ROLE`;
      return res;
    });
    console.log("Manager SELECT returned:", managerResult.length, "rows.");
    if (managerResult.length === 1 && managerResult[0].encrypted_config.key_secret === 'SUPER_SECRET_HMAC_KEY') {
      console.log("✅ SUCCESS: Manager was ALLOWED to read payment secrets.");
    } else {
      console.error("❌ FAILURE: Manager was BLOCKED or read wrong data.");
      process.exit(1);
    }

    // 4. Clean up test config
    console.log("\nCleaning up test integration...");
    await sql`DELETE FROM payment_integrations WHERE id = ${inserted.id}`;
    console.log("✓ Cleaned up successfully.");
    console.log("\n=================================================");
    console.log("🎉 ALL RLS VERIFICATION TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================");

  } catch (err) {
    console.error("❌ Verification error:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
