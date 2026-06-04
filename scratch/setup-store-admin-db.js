const { createClient } = require('@supabase/supabase-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres';
const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 20,
});

async function run() {
  console.log("=== Setting up Store Admin Database Schema and Seed ===");
  try {
    // 1. Test postgres connection
    console.log("\n1. Connecting to PostgreSQL database...");
    await sql`SELECT 1`;
    console.log("Connected successfully!");

    // 2. Drop tables in correct order if they exist to avoid conflict
    console.log("\n2. Dropping existing store admin tables (if any) to ensure clean schema run...");
    await sql`DROP TABLE IF EXISTS public.store_settings CASCADE;`;
    await sql`DROP TABLE IF EXISTS public.staff_accounts CASCADE;`;
    await sql`DROP TABLE IF EXISTS public.locations CASCADE;`;
    await sql`DROP TABLE IF EXISTS public.tenants CASCADE;`;
    console.log("Dropped tables.");

    // 3. Read and execute schema.sql
    console.log("\n3. Executing schema.sql...");
    const schemaPath = path.join(__dirname, '../cafe-canvas-store-admin/supabase/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await sql.unsafe(schemaSql);
    console.log("✓ schema.sql executed successfully!");

    // 4. Read and execute seed.sql
    console.log("\n4. Executing seed.sql...");
    const seedPath = path.join(__dirname, '../cafe-canvas-store-admin/supabase/seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await sql.unsafe(seedSql);
    console.log("✓ seed.sql executed successfully!");

    // 5. Manage owner@aether-cafe.com auth user
    console.log("\n5. Managing auth user owner@aether-cafe.com...");
    const { data: { users } } = await admin.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === 'owner@aether-cafe.com');
    let userId;
    
    if (existingUser) {
      console.log(`Found existing user with ID: ${existingUser.id}. Deleting for clean slate...`);
      await admin.auth.admin.deleteUser(existingUser.id);
      console.log("Deleted existing auth user.");
    }
    
    console.log("Creating new auth user owner@aether-cafe.com with pre-confirmed email...");
    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: 'owner@aether-cafe.com',
      password: 'AetherOwner123!',
      email_confirm: true,
      user_metadata: { name: 'Aether Café Owner' }
    });

    if (createError) {
      console.error("Failed to create auth user:", createError);
      return;
    }
    userId = userData.user.id;
    console.log(`✓ Auth user created successfully with ID: ${userId}`);

    // 6. Insert owner staff account row since it wasn't in the default 50 staff seed list
    console.log("\n6. Inserting owner record in public.staff_accounts and linking auth_user_id...");
    await sql`
      INSERT INTO public.staff_accounts (tenant_id, full_name, email, role, pin, location_id, auth_user_id)
      VALUES (
        'aaaaaaaa-0000-0000-0000-000000000001',
        'Aether Café Owner',
        'owner@aether-cafe.com',
        'manager',
        '1000',
        'bbbbbbbb-0000-0000-0000-000000000001',
        ${userId}
      )
      ON CONFLICT (email) DO UPDATE 
      SET auth_user_id = ${userId};
    `;

    // Double check that it is updated
    const staff = await sql`SELECT * FROM public.staff_accounts WHERE email = 'owner@aether-cafe.com'`;
    console.log("✓ Seeded owner staff account detail:", staff);

  } catch (error) {
    console.error("\n❌ Database setup failed:");
    console.error(error.message || error);
  } finally {
    await sql.end();
    console.log("\nPostgreSQL connection closed.");
  }
}

run();
