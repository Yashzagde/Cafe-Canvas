const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from root env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is missing!");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function query() {
  try {
    console.log("Fetching bills columns...");
    const columns = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bills'`;
    console.table(columns);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await sql.end();
  }
}

query();
