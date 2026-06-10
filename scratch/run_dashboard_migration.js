const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clear PG variables
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

const postgres = require('postgres');
const sql = postgres(dbUrl, { ssl: 'require' });

async function run() {
  try {
    console.log("Applying 010_dashboard_tables.sql migration to remote database...");
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', '010_dashboard_tables.sql');
    if (!fs.existsSync(filePath)) {
      console.error("Migration file not found at " + filePath);
      process.exit(1);
    }
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    await sql.unsafe(sqlContent);
    console.log("✓ Migration executed successfully!");
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
