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
    const startOfToday = new Date('2026-06-13T00:00:00Z');
    const endOfToday = new Date('2026-06-13T23:59:59Z');

    const bills = await sql`
      SELECT id, status, total_paise, created_at, paid_at
      FROM public.bills
      WHERE created_at >= ${startOfToday} AND created_at <= ${endOfToday}
    `;
    console.log("Bills on 2026-06-13 (UTC):");
    console.table(bills);

    const localStartOfToday = new Date('2026-06-13T00:00:00+05:30');
    const localEndOfToday = new Date('2026-06-13T23:59:59+05:30');

    const billsLocal = await sql`
      SELECT id, status, total_paise, created_at, paid_at
      FROM public.bills
      WHERE created_at >= ${localStartOfToday} AND created_at <= ${localEndOfToday}
    `;
    console.log("\nBills on 2026-06-13 (IST - Local Time):");
    console.table(billsLocal);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
