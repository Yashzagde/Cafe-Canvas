const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function main() {
  console.log("Cleaning up test tenants (canvacafe, canvascoffee, canvasbar)...");
  try {
    // Get tenant IDs
    const tenants = await sql`SELECT id FROM public.tenants WHERE slug IN ('canvacafe', 'canvascoffee', 'canvasbar')`;
    const tenantIds = tenants.map(t => t.id);

    if (tenantIds.length > 0) {
      console.log(`Found ${tenantIds.length} test tenants. Deleting associated auth.users and identities...`);
      
      // Delete staff accounts
      const staffAccounts = await sql`SELECT id FROM public.staff_accounts WHERE tenant_id = ANY(${tenantIds})`;
      const staffIds = staffAccounts.map(s => s.id);

      if (staffIds.length > 0) {
        // Delete auth identities
        const delIdentities = await sql`DELETE FROM auth.identities WHERE user_id = ANY(${staffIds})`;
        console.log(`Deleted ${delIdentities.count} auth identities.`);

        // Delete auth users
        const delUsers = await sql`DELETE FROM auth.users WHERE id = ANY(${staffIds})`;
        console.log(`Deleted ${delUsers.count} auth users.`);
      }

      // Delete tenants (cascade deletes locations and staff_accounts)
      const delTenants = await sql`DELETE FROM public.tenants WHERE id = ANY(${tenantIds})`;
      console.log(`Deleted ${delTenants.count} tenants.`);
    } else {
      console.log("No test tenants found.");
    }
  } catch (err) {
    console.error("Cleanup failed:", err);
  } finally {
    await sql.end();
  }
}

main();
