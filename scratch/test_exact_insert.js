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
    // Check if yzagde605@gmail.com exists anywhere
    console.log("=== Check if yzagde605@gmail.com exists in staff_accounts ===");
    const existing = await sql`
      SELECT id, email, tenant_id, role FROM public.staff_accounts WHERE email = 'yzagde605@gmail.com';
    `;
    console.log(existing.length > 0 ? existing : "Not found");

    // Check if this email exists in auth.users
    console.log("\n=== Check if yzagde605@gmail.com exists in auth.users ===");
    const authUser = await sql`
      SELECT id, email FROM auth.users WHERE email = 'yzagde605@gmail.com';
    `;
    console.log(authUser.length > 0 ? authUser : "Not found");

    // Test: Simulate the exact insert the modal would do
    console.log("\n=== Simulating exact insert from AddStaffModal ===");
    try {
      const insertResult = await sql`
        INSERT INTO public.staff_accounts (tenant_id, full_name, email, phone, role, pin, location_id, is_active)
        VALUES (
          'c1000000-0000-0000-0000-000000000001',
          'yash zagade',
          'yzagde605@gmail.com',
          '8408060787',
          'staff',
          '9001',
          'd1000000-0000-0000-0000-000000000001',
          true
        )
        RETURNING id, full_name, email;
      `;
      console.log("Insert SUCCESS:", insertResult);
      // Clean up
      await sql`DELETE FROM public.staff_accounts WHERE email = 'yzagde605@gmail.com';`;
      console.log("Cleaned up test row");
    } catch (insertErr) {
      console.error("Insert FAILED:", insertErr.message);
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
