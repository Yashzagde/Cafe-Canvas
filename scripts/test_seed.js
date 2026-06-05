const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  console.log("DB URL:", dbUrl ? "Loaded" : "Missing");
  const postgres = require('postgres');
  const sql = postgres(dbUrl, { ssl: 'require' });

  const seedFile = path.join(__dirname, '..', 'supabase', 'migrations', '003_seed_data.sql');
  console.log("Seed File Path:", seedFile);
  console.log("File exists:", fs.existsSync(seedFile));
  const content = fs.readFileSync(seedFile, 'utf8');

  // Split statements by semicolon
  const statements = content
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log("Total statements to execute:", statements.length);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`Executing statement ${i + 1}/${statements.length}:`);
    console.log(stmt.substring(0, 100) + (stmt.length > 100 ? '...' : ''));
    try {
      const res = await sql.unsafe(stmt);
      console.log(`✓ Success!`);
    } catch (err) {
      console.error(`❌ Failed: ${err.message}`);
    }
  }

  await sql.end();
}

run();
