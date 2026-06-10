const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Clear PG environment variables to prevent postgres client from picking up AWS DSQL credentials instead of DATABASE_URL
delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const migrationFiles = [
  '001_clean_schema.sql',
  '002_rls_policies.sql',
  '003_seed_data.sql',
  '004_add_public_id.sql'
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
  
  // Parse DATABASE_URL to connect to Session-mode pooler on port 5432
  let connectionConfig;
  try {
    const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/(.+)/;
    const match = dbUrl.match(urlPattern);
    if (match) {
      const [_, user, pass, host, port, db] = match;
      connectionConfig = {
        host: host,
        port: 5432, // Session mode pooler port
        database: db,
        username: user,
        password: pass,
        ssl: 'require',
        max: 1,
        connect_timeout: 30
      };
    } else {
      connectionConfig = dbUrl;
    }
  } catch (err) {
    connectionConfig = dbUrl;
  }

  const sql = typeof connectionConfig === 'object' 
    ? postgres(connectionConfig) 
    : postgres(dbUrl, { ssl: 'require', connect_timeout: 15 });

  try {
    console.log("Connecting to remote Supabase database...");
    await sql`SELECT 1`;
    console.log("Connected successfully!");

    console.log("\nDropping all views and tables in public schema...");
    await sql.unsafe(`
      -- Drop all views in public schema
      DO $$
      DECLARE
        view_rec RECORD;
      BEGIN
        FOR view_rec IN (
          SELECT table_name
          FROM information_schema.views
          WHERE table_schema = 'public'
        ) LOOP
          EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(view_rec.table_name) || ' CASCADE';
        END LOOP;
      END $$;

      -- Drop all tables in public schema
      DO $$
      DECLARE
        tbl RECORD;
      BEGIN
        FOR tbl IN (
          SELECT tablename
          FROM pg_tables
          WHERE schemaname = 'public'
        ) LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(tbl.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    console.log("✓ Public schema cleanup completed!");

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
