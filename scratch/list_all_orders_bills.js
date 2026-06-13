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
    const orders = await sql`
      SELECT *
      FROM public.orders
    `;
    console.log("All Orders in database:");
    if (orders.length > 0) {
      console.log("Columns:", Object.keys(orders[0]));
      console.table(orders.map(o => ({ id: o.id, tenant_id: o.tenant_id, status: o.status, created_at: o.created_at })));
    } else {
      console.log("No orders found.");
    }

    const bills = await sql`
      SELECT *
      FROM public.bills
    `;
    console.log("\nAll Bills in database:");
    if (bills.length > 0) {
      console.log("Columns:", Object.keys(bills[0]));
      console.table(bills.map(b => ({ id: b.id, tenant_id: b.tenant_id, status: b.status, subtotal_paise: b.subtotal_paise, total_paise: b.total_paise, created_at: b.created_at, paid_at: b.paid_at })));
    } else {
      console.log("No bills found.");
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
