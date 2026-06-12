const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from frontend/.env.local or root env if present
dotenv.config({ path: path.join(__dirname, '../frontend/.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function query() {
  try {
    console.log("Fetching store_settings columns...");
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'store_settings'`;
    console.table(columns);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await sql.end();
  }
}

query();
