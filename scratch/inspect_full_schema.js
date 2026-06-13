const postgres = require('postgres');
const path = require('path');
const fs = require('fs');
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
    const columns = await sql`
      SELECT table_name, column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    
    const constraints = await sql`
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        tc.constraint_type,
        cc.check_clause
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;

    fs.writeFileSync('d:\\Cafe Canva\\scratch\\db_columns.json', JSON.stringify(columns, null, 2));
    fs.writeFileSync('d:\\Cafe Canva\\scratch\\db_constraints.json', JSON.stringify(constraints, null, 2));
    console.log('Successfully wrote columns and constraints to JSON files in scratch folder.');
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sql.end();
  }
}

main();
