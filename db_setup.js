const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const migrationFiles = [
  '001_schema.sql',
  '002_rls_policies.sql',
  '003_seed_demo.sql',
  '004_fix_rls_anon_insert.sql',
  '005_blogs.sql',
  '006_review_cache.sql',
  '007_analytics_views.sql',
  '008_indexes.sql'
];

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans);
  }));
}

async function run() {
  console.log("=================================================");
  console.log(" CafeCanvas Database Setup & Migration Utility   ");
  console.log("=================================================\n");

  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL not found in environment or .env file.");
    process.exit(1);
  }

  if (dbUrl.includes('[YOUR-PASSWORD]')) {
    console.log("Your DATABASE_URL contains the '[YOUR-PASSWORD]' placeholder.");
    const password = await askQuestion("Please enter your remote Supabase database password: ");
    if (!password) {
      console.error("Password cannot be empty.");
      process.exit(1);
    }
    dbUrl = dbUrl.replace('[YOUR-PASSWORD]', encodeURIComponent(password));
  }

  const postgres = require('postgres');
  const sql = postgres(dbUrl, {
    ssl: 'require',
    connect_timeout: 10,
  });

  try {
    console.log("\nConnecting to remote Supabase database...");
    
    // Test connection
    await sql`SELECT 1`;
    console.log("Connected successfully!");

    for (const file of migrationFiles) {
      console.log(`\nExecuting migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        console.error(`Migration file ${file} not found in ${migrationsDir}`);
        continue;
      }

      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Execute the migration content
      await sql.unsafe(sqlContent);
      console.log(`✓ Migration ${file} executed successfully.`);
    }

    console.log("\n=================================================");
    console.log("✓ All 8 migrations completed successfully!");
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error.message || error);
  } finally {
    await sql.end();
  }
}

run();
