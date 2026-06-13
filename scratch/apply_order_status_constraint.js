const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clean PG environment variables to prevent postgres client from using AWS DSQL settings
delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL found in .env.local");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function main() {
  try {
    console.log("Updating check constraint orders_status_check on orders...");
    
    await sql`
      ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
    `;
    console.log("✓ Old constraint dropped.");

    await sql`
      ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'billed', 'paid', 'cancelled'));
    `;
    console.log("✓ New constraint added successfully!");

    // Verify
    const constraints = await sql`
      SELECT conname, pg_get_constraintdef(c.oid) as definition
      FROM pg_constraint c 
      JOIN pg_namespace n ON n.oid = c.connamespace 
      WHERE c.conrelid = 'orders'::regclass AND c.conname = 'orders_status_check';
    `;
    console.log("Updated constraint definition:");
    console.log(JSON.stringify(constraints, null, 2));

  } catch (err) {
    console.error("❌ Failed to update constraint:", err instanceof Error ? err.message : String(err));
  } finally {
    await sql.end();
  }
}

main();
