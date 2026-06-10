const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("No DATABASE_URL found");
  process.exit(1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function run() {
  try {
    const tables = ['modifier_groups', 'modifier_options', 'menu_item_modifier_groups'];
    for (const table of tables) {
      const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = ${table}
      `;
      console.log(`\nCOLUMNS FOR ${table}:`);
      console.table(columns);
    }
  } catch (err) {
    console.error("Error:", err.message || err);
  } finally {
    await sql.end();
  }
}

run();
