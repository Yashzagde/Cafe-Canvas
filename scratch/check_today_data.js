const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL is missing");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    console.log(`Checking data from: ${todayISO}\n`);

    // 1. Check all orders created today
    const orders = await sql`
      SELECT *
      FROM public.orders
      WHERE created_at >= ${todayISO} AND tenant_id = '3e32dc04-191d-4292-9968-d771f16060a7'
    `;
    console.log("Orders created today:");
    console.table(orders);

    // 2. Check all bills created/paid today
    const bills = await sql`
      SELECT *
      FROM public.bills
      WHERE (created_at >= ${todayISO} OR paid_at >= ${todayISO}) AND tenant_id = '3e32dc04-191d-4292-9968-d771f16060a7'
    `;
    console.log("Bills created/paid today:");
    console.table(bills);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
