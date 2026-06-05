const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is missing.");
    return;
  }
  const sql = postgres(dbUrl, { ssl: 'require' });
  try {
    const email = 'yashzagde01@gmail.com';
    const password = 'yashz562';
    
    console.log("1. Deleting existing user from auth.users...");
    await sql`
      DELETE FROM auth.users WHERE email = ${email};
    `;
    console.log("✓ User deleted.");

    const userId = 'a0000000-0000-0000-0000-000000000099'; // We can use our constant hex UUID!
    const identityId = 'ae0ec5b5-edcf-4490-bbf8-2e22a47cba44'; // Random valid hex UUID
    
    console.log("2. Inserting user into auth.users...");
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
        '{"name": "Yash Zagde", "email_verified": true}'::jsonb,
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
    console.log("✓ User inserted into auth.users.");

    console.log("3. Inserting identity into auth.identities...");
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
    console.log("✓ Identity inserted into auth.identities.");

    console.log("4. Linking staff account to auth_user_id...");
    const staffResult = await sql`
      UPDATE public.staff_accounts
      SET auth_user_id = ${userId}
      WHERE email = ${email}
      RETURNING id, tenant_id, location_id;
    `;
    if (staffResult.length > 0) {
      console.log("✓ Linked staff account:", staffResult[0]);
    } else {
      console.log("⚠️ No staff account found with email 'yashzagde01@gmail.com'. Re-inserting one...");
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
          'e1000000-0000-0000-0000-000000000001',
          'c1000000-0000-0000-0000-000000000001',
          'd1000000-0000-0000-0000-000000000001',
          ${userId},
          'Yash Zagde',
          ${email},
          '+919876543210',
          'manager',
          '1234',
          TRUE
        );
      `;
      console.log("✓ Staff account inserted and linked.");
    }

    console.log("===============================================");
    console.log("✓ SQL-based Auth Re-creation completed successfully!");
    console.log("===============================================");

  } catch (err) {
    console.error("❌ SQL execution failed:", err.message);
  } finally {
    await sql.end();
  }
}

main();
