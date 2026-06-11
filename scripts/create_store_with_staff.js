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
  const storeName = args[0] || "Canva Cafe";
  const slug = args[1] || "canvacafe";

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
    console.log("=================================================");
    console.log(`Creating Store: "${storeName}" (${slug})...`);
    console.log("=================================================\n");

    // Generate Tenant IDs
    const tenantId = crypto.randomUUID();
    const publicId = crypto.randomUUID();
    const privateId = tenantId; // Align private_id with core tenant id

    // 1. Check if slug already exists
    const existingTenant = await sql`SELECT id FROM public.tenants WHERE slug = ${slug}`;
    if (existingTenant.length > 0) {
      console.error(`Error: A store with slug '${slug}' already exists.`);
      return;
    }

    // 2. Insert Tenant
    console.log("1. Registering tenant in public.tenants...");
    const tenantEmail = `info@${slug}.com`;
    await sql`
      INSERT INTO public.tenants (id, name, slug, email, phone, address, city, state, pincode, subscription_tier, is_active, public_id, private_id, created_at)
      VALUES (${tenantId}, ${storeName}, ${slug}, ${tenantEmail}, '1234567890', '123 Canva Street', 'Mumbai', 'Maharashtra', '400001', 'Enterprise', true, ${publicId}, ${privateId}, NOW())
    `;

    // 3. Insert Location
    const locationId = crypto.randomUUID();
    console.log("2. Creating location in public.locations...");
    await sql`
      INSERT INTO public.locations (id, tenant_id, name, address, created_at)
      VALUES (${locationId}, ${tenantId}, 'Main Branch', '123 Canva Street, Mumbai', NOW())
    `;

    // 4. Create Store Settings (default CGST 2.5% & SGST 2.5%)
    console.log("3. Creating default store settings...");
    await sql`
      INSERT INTO public.store_settings (id, tenant_id, currency, tax_cgst, tax_sgst, tax_inclusive)
      VALUES (${crypto.randomUUID()}, ${tenantId}, 'INR', 250, 250, false)
    `;

    // 5. Create Store Admin account (role: manager)
    const adminEmail = `admin@${slug}.com`;
    const adminPassword = "adminpassword123";
    const adminPin = "9999";
    const adminUserId = crypto.randomUUID();
    const adminIdentityId = crypto.randomUUID();

    console.log(`4. Creating Store Admin in auth.users (${adminEmail})...`);
    await sql`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', ${adminUserId}, 'authenticated', 'authenticated',
        ${adminEmail}, crypt(${adminPassword}, gen_salt('bf', 10)), NOW(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        ${sql.json({ name: "Store Admin", email_verified: true })},
        false, false, NOW(), NOW()
      )
    `;

    await sql`
      INSERT INTO auth.identities (
        id, user_id, provider_id, provider, identity_data, created_at, updated_at
      ) VALUES (
        ${adminIdentityId}, ${adminUserId}, ${adminUserId}, 'email',
        ${sql.json({ sub: adminUserId, email: adminEmail, email_verified: true })},
        NOW(), NOW()
      )
    `;

    await sql`
      INSERT INTO public.staff_accounts (
        id, tenant_id, location_id, auth_user_id, full_name, email, role, pin, is_active, created_at
      ) VALUES (
        ${adminUserId}, ${tenantId}, ${locationId}, ${adminUserId}, 'Store Admin', ${adminEmail}, 'manager', ${adminPin}, true, NOW()
      )
    `;

    // 6. Create 20 Staff sub-accounts using phone numbers
    console.log("\n5. Registering 20 Staff sub-accounts using phone numbers...");
    const basePhone = 9876500000;
    for (let i = 1; i <= 20; i++) {
      const phoneNum = String(basePhone + i);
      const staffEmail = `${phoneNum}@cafecanvas.bar`;
      const staffPassword = `staffpassword123`;
      const staffPin = `20${String(i).padStart(2, '0')}`; // PIN: 2001, 2002, ..., 2020
      const staffUserId = crypto.randomUUID();
      const staffIdentityId = crypto.randomUUID();
      const staffName = `Staff Member ${i}`;

      console.log(`   - Creating ${staffName} (Phone: ${phoneNum}) with PIN ${staffPin}...`);

      await sql`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, phone, encrypted_password, email_confirmed_at, phone_confirmed_at,
          raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous, created_at, updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000', ${staffUserId}, 'authenticated', 'authenticated',
          ${staffEmail}, ${phoneNum}, crypt(${staffPassword}, gen_salt('bf', 10)), NOW(), NOW(),
          '{"provider": "email", "providers": ["email"]}'::jsonb,
          ${sql.json({ name: staffName, email_verified: true, phone_verified: true })},
          false, false, NOW(), NOW()
        )
      `;

      await sql`
        INSERT INTO auth.identities (
          id, user_id, provider_id, provider, identity_data, created_at, updated_at
        ) VALUES (
          ${staffIdentityId}, ${staffUserId}, ${staffUserId}, 'email',
          ${sql.json({ sub: staffUserId, email: staffEmail, email_verified: true })},
          NOW(), NOW()
        )
      `;

      await sql`
        INSERT INTO public.staff_accounts (
          id, tenant_id, location_id, auth_user_id, full_name, email, phone, role, pin, is_active, created_at
        ) VALUES (
          ${staffUserId}, ${tenantId}, ${locationId}, ${staffUserId}, ${staffName}, ${staffEmail}, ${phoneNum}, 'staff', ${staffPin}, true, NOW()
        )
      `;
    }

    console.log("\n===============================================");
    console.log("✓ Store and all 21 accounts initialized successfully!");
    console.log(`- Tenant UUID (Private ID): ${tenantId}`);
    console.log(`- Tenant Public UUID:       ${publicId}`);
    console.log(`- Store Slug:               ${slug}`);
    console.log("\nAccounts List:");
    console.log(`- 1x Store Admin:           ${adminEmail} (password: ${adminPassword}, PIN: ${adminPin})`);
    console.log(`- 20x Staff Sub-accounts:   Phone numbers 9876500001 to 9876500020`);
    console.log(`                             (password: staffpassword123, PINs: 2001 to 2020)`);
    console.log(`                             (constructed emails: <phone>@cafecanvas.bar)`);
    console.log("===============================================");

  } catch (err) {
    console.error("\n❌ Initialization failed:");
    console.error(err.message || err);
  } finally {
    await sql.end();
  }
}

main();
