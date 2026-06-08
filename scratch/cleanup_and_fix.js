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
    // 1. Check if the hook is registered in auth config
    console.log("=== auth.flow_state (hooks config) ===");
    try {
      const hookConfig = await sql`
        SELECT * FROM auth.flow_state LIMIT 5;
      `;
      console.log(hookConfig);
    } catch(e) {
      console.log("flow_state not accessible:", e.message);
    }

    // 2. Now let's clean up the duplicate and fix the real problem
    // First, see all accounts with yzagde605@gmail.com
    console.log("\n=== All staff accounts ===");
    const all = await sql`
      SELECT id, full_name, email, role, is_active, auth_user_id, created_at 
      FROM public.staff_accounts 
      ORDER BY created_at;
    `;
    console.table(all);

    // 3. Delete the orphaned record that was created without proper auth
    console.log("\n=== Deleting orphaned yzagde605@gmail.com record ===");
    const deleted = await sql`
      DELETE FROM public.staff_accounts 
      WHERE email = 'yzagde605@gmail.com' 
      AND auth_user_id IS NULL
      RETURNING id, email;
    `;
    console.log("Deleted:", deleted);
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
