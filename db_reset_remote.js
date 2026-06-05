const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const migrationFiles = [
  '001_clean_schema.sql',
  '002_rls_policies.sql',
  '003_seed_data.sql'
];

async function run() {
  console.log("=================================================");
  console.log(" CafeCanvas Database Remote Reset Utility        ");
  console.log("=================================================\n");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL not found in .env.local file.");
    process.exit(1);
  }

  const postgres = require('postgres');
  const sql = postgres(dbUrl, {
    ssl: 'require',
    connect_timeout: 15,
  });

  try {
    console.log("Connecting to remote Supabase database...");
    await sql`SELECT 1`;
    console.log("Connected successfully!");

    console.log("\nDropping and recreating public schema...");
    await sql.unsafe(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO anon;
      GRANT ALL ON SCHEMA public TO authenticated;
      GRANT ALL ON SCHEMA public TO service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
    `);
    console.log("✓ Public schema reset completed!");

    for (const file of migrationFiles) {
      console.log(`\nExecuting migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file ${file} not found in ${migrationsDir}`);
      }

      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // Execute the migration content
      await sql.unsafe(sqlContent);
      console.log(`✓ Migration ${file} executed successfully.`);
    }

    console.log("\nCleaning up old migration files from supabase/migrations/ directory...");
    const files = fs.readdirSync(migrationsDir);
    for (const file of files) {
      if (!migrationFiles.includes(file)) {
        fs.unlinkSync(path.join(migrationsDir, file));
        console.log(`- Deleted old migration file: ${file}`);
      }
    }

    console.log("\nRecreating and linking auth user 'yashzagde01@gmail.com' via SQL...");
    const { execSync } = require('child_process');
    try {
      execSync('node scripts/recreate_auth_user_sql.js', { stdio: 'inherit' });
      console.log("✓ Auth user recreation completed.");
    } catch (e) {
      console.error("⚠️ Failed to recreate auth user:", e.message);
    }

    console.log("\n=================================================");
    console.log("✓ Clean schema reset completed successfully!");
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ Database reset failed:");
    console.error(error.message || error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
