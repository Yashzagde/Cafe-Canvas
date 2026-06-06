const postgres = require('postgres');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Clear PG environment variables to prevent postgres client from picking up AWS DSQL credentials instead of DATABASE_URL
delete process.env.PGHOST;
delete process.env.PGPORT;
delete process.env.PGUSER;
delete process.env.PGDATABASE;
delete process.env.PGSSLMODE;

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 5) {
    console.log("Usage: node scripts/create_subaccount.js <email> <password> <role> <pin> <fullName>");
    console.log("Example: node scripts/create_subaccount.js cashier1@test.com mypass123 cashier 2580 \"Cashier One\"");
    return;
  }

  const [email, password, role, pin, fullName] = args;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Error: DATABASE_URL is missing in .env.local");
    return;
  }

  // Parse DATABASE_URL: postgresql://<user>:<password>@<host>:<port>/<db>
  let connectionConfig;
  try {
    const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/(.+)/;
    const match = dbUrl.match(urlPattern);
    if (match) {
      const [_, user, pass, host, port, db] = match;
      let directHost = host;
      if (host.includes('pooler.supabase.com')) {
        const projectRef = user.split('.')[1];
        if (projectRef) {
          directHost = `db.${projectRef}.supabase.co`;
        }
      }
      connectionConfig = {
        host: directHost,
        port: 5432, // use direct port
        database: db,
        username: user.split('.')[0] || 'postgres',
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

  const sql = typeof connectionConfig === 'object' ? postgres(connectionConfig) : postgres(connectionConfig, { ssl: 'require' });

  try {
    console.log(`Connecting to database to create sub-account for: ${email}...`);

    // 1. Get default tenant and location
    const tenants = await sql`SELECT id FROM public.tenants LIMIT 1`;
    if (tenants.length === 0) {
      console.error("Error: No tenants found in database. Please run seed script first.");
      return;
    }
    const tenantId = tenants[0].id;

    const locations = await sql`SELECT id FROM public.locations WHERE tenant_id = ${tenantId} LIMIT 1`;
    const locationId = locations.length > 0 ? locations[0].id : null;

    // 2. Generate UUIDs
    const userId = crypto.randomUUID();
    const identityId = crypto.randomUUID();

    // 3. Check if user already exists
    const existing = await sql`SELECT id FROM auth.users WHERE email = ${email}`;
    if (existing.length > 0) {
      console.error(`Error: User with email '${email}' already exists in auth.users.`);
      return;
    }

    console.log("1. Creating user in auth.users...");
    await sql`
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_sso_user,
        is_anonymous,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change,
        phone_change,
        phone_change_token,
        email_change_token_current,
        email_change_confirm_status,
        created_at,
        updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        ${userId},
        'authenticated',
        'authenticated',
        ${email},
        crypt(${password}, gen_salt('bf', 10)),
        NOW(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        ${sql.json({ name: fullName, email_verified: true })},
        false,
        false,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        0,
        NOW(),
        NOW()
      );
    `;

    console.log("2. Creating identity in auth.identities...");
    const identityData = {
      sub: userId,
      email: email,
      email_verified: true,
      phone_verified: false
    };

    await sql`
      INSERT INTO auth.identities (
        id,
        user_id,
        provider_id,
        provider,
        identity_data,
        created_at,
        updated_at
      ) VALUES (
        ${identityId},
        ${userId},
        ${userId},
        'email',
        ${sql.json(identityData)},
        NOW(),
        NOW()
      );
    `;

    console.log("3. Creating staff account in public.staff_accounts...");
    await sql`
      INSERT INTO public.staff_accounts (
        id,
        tenant_id,
        location_id,
        auth_user_id,
        full_name,
        email,
        phone,
        role,
        pin,
        is_active
      ) VALUES (
        ${userId},
        ${tenantId},
        ${locationId},
        ${userId},
        ${fullName},
        ${email},
        null,
        ${role},
        ${pin},
        TRUE
      );
    `;

    console.log("\n===============================================");
    console.log("✓ Sub-account created successfully!");
    console.log(`- Email: ${email}`);
    console.log(`- Role: ${role}`);
    console.log(`- PIN: ${pin}`);
    console.log(`- Full Name: ${fullName}`);
    console.log("===============================================");

  } catch (err) {
    console.error("❌ SQL execution failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
