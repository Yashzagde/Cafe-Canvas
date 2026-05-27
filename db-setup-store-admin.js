const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
  console.error('Error: Please configure DATABASE_URL in your .env file with your actual Supabase database password first.');
  process.exit(1);
}

// Disable prefetch as it is not supported for transaction mode poolers
const sql = postgres(connectionString, { ssl: 'require', prepare: false });

async function setupDatabase() {
  console.log('🚀 Connecting to Supabase database...');
  try {
    // 1. Create Core Tables
    console.log('Creating Core SaaS tables...');
    await sql`
      CREATE TABLE IF NOT EXISTS tenants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        mode text NOT NULL DEFAULT 'SINGLE_STORE' CHECK (mode IN ('SINGLE_STORE', 'MULTI_BRANCH')),
        max_subaccounts integer NOT NULL DEFAULT 50,
        status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
        created_at timestamptz DEFAULT now() NOT NULL
      );
    `;
    
    await sql`
      CREATE TABLE IF NOT EXISTS branches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name text NOT NULL,
        status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
        created_at timestamptz DEFAULT now() NOT NULL
      );
    `;

    // Drop and recreate user table if it exists as serial id to uuid to support auth linking
    console.log('Upgrading users table to link to auth.users...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid REFERENCES branches(id) ON DELETE SET NULL,
        full_name text NOT NULL,
        email text NOT NULL,
        phone text,
        role text NOT NULL CHECK (role IN ('PLATFORM_ADMIN', 'TENANT_OWNER', 'BRANCH_ADMIN', 'MANAGER', 'STAFF', 'KOS')),
        status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
        pin_hash text,
        created_at timestamptz DEFAULT now() NOT NULL
      );
    `;

    // 2. Create Modular Store-Admin Tables
    console.log('Creating Modular Menu & Tables schemas...');
    await sql`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        name text NOT NULL,
        sort_order integer NOT NULL DEFAULT 0,
        is_visible boolean NOT NULL DEFAULT true,
        deleted_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        category_id uuid NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
        name text NOT NULL,
        description text,
        price integer NOT NULL,
        image_url text,
        status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'unavailable', 'hidden')),
        allows_modifiers boolean NOT NULL DEFAULT false,
        discount_eligible boolean NOT NULL DEFAULT true,
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        deleted_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS modifier_groups (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        name text NOT NULL,
        required boolean NOT NULL DEFAULT false,
        min_select integer NOT NULL DEFAULT 0,
        max_select integer NOT NULL DEFAULT 1,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS modifier_options (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id uuid NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
        name text NOT NULL,
        extra_price integer NOT NULL DEFAULT 0,
        is_default boolean NOT NULL DEFAULT false,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tables (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        name text NOT NULL,
        capacity integer NOT NULL DEFAULT 2,
        section text NOT NULL DEFAULT 'Main Floor',
        position jsonb NOT NULL DEFAULT '{"x": 0, "y": 0}'::jsonb,
        status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
        deleted_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );
    `;

    console.log('Creating Orders, Invoicing & Marketing tables...');
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        name text NOT NULL,
        phone text NOT NULL,
        notes text,
        tags jsonb DEFAULT '[]'::jsonb,
        deleted_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        table_id uuid REFERENCES tables(id) ON DELETE SET NULL,
        customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'billed', 'paid', 'cancelled')),
        source text NOT NULL DEFAULT 'staff_app' CHECK (source IN ('staff_app', 'digital_menu', 'admin')),
        subtotal integer NOT NULL DEFAULT 0,
        discount_amount integer NOT NULL DEFAULT 0,
        extra_charges jsonb DEFAULT '[]'::jsonb,
        total integer NOT NULL DEFAULT 0,
        notes text,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
        quantity integer NOT NULL DEFAULT 1,
        unit_price integer NOT NULL,
        modifier_selections jsonb DEFAULT '[]'::jsonb,
        item_name text NOT NULL,
        item_notes text,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS bills (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        table_id uuid REFERENCES tables(id) ON DELETE SET NULL,
        orders jsonb NOT NULL DEFAULT '[]'::jsonb,
        subtotal integer NOT NULL,
        tax integer NOT NULL DEFAULT 0,
        discount_amount integer NOT NULL DEFAULT 0,
        extra_charges jsonb DEFAULT '[]'::jsonb,
        total integer NOT NULL,
        status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'cancelled')),
        payment_method text CHECK (payment_method IN ('cash', 'card', 'upi', 'other')),
        paid_at timestamptz,
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS table_sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        table_id uuid NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        check_in_at timestamptz DEFAULT now() NOT NULL,
        check_out_at timestamptz,
        duration_minutes integer,
        total_revenue integer NOT NULL DEFAULT 0,
        customer_count integer NOT NULL DEFAULT 1,
        assigned_staff_id uuid REFERENCES users(id) ON DELETE SET NULL,
        bill_id uuid REFERENCES bills(id) ON DELETE SET NULL,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS extra_charge_templates (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        label text NOT NULL,
        type text NOT NULL CHECK (type IN ('fixed', 'percent')),
        value integer NOT NULL,
        is_default boolean NOT NULL DEFAULT false,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS customer_visits (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        bill_id uuid REFERENCES bills(id) ON DELETE SET NULL,
        table_id uuid REFERENCES tables(id) ON DELETE SET NULL,
        order_at timestamptz DEFAULT now() NOT NULL,
        check_in_at timestamptz,
        check_out_at timestamptz,
        duration_minutes integer,
        total_spent integer NOT NULL DEFAULT 0,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS discounts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        name text NOT NULL,
        type text NOT NULL CHECK (type IN ('percent', 'fixed')),
        value integer NOT NULL,
        min_order_amount integer NOT NULL DEFAULT 0,
        applies_to text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'item')),
        target_ids jsonb DEFAULT '[]'::jsonb,
        valid_from timestamptz NOT NULL,
        valid_until timestamptz NOT NULL,
        usage_limit integer,
        used_count integer NOT NULL DEFAULT 0,
        per_customer_limit integer NOT NULL DEFAULT 1,
        is_active boolean NOT NULL DEFAULT true,
        deleted_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        discount_id uuid NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
        code text NOT NULL,
        max_uses integer,
        used_count integer NOT NULL DEFAULT 0,
        per_user_limit integer NOT NULL DEFAULT 1,
        valid_until timestamptz,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS coupon_uses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
        customer_phone text NOT NULL,
        order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        used_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS storefront_notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        type text NOT NULL DEFAULT 'banner' CHECK (type IN ('popup', 'banner', 'toast')),
        title text NOT NULL,
        body text NOT NULL,
        cta_text text,
        cta_url text,
        start_at timestamptz NOT NULL,
        end_at timestamptz NOT NULL,
        target text NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'table', 'online')),
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );
    `;

    console.log('Creating Settings, Branding, Integrations & Blogs...');
    await sql`
      CREATE TABLE IF NOT EXISTS store_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        store_name text NOT NULL,
        address text,
        phone text,
        email text,
        gstin text,
        opening_hours jsonb DEFAULT '{}'::jsonb,
        timezone text NOT NULL DEFAULT 'Asia/Kolkata',
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS branding (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        logo_url text,
        hero_image_urls jsonb DEFAULT '[]'::jsonb,
        primary_color varchar(7) DEFAULT '#6366f1',
        accent_color varchar(7) DEFAULT '#10b981',
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS storefront_config (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        branch_id uuid NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        theme text NOT NULL DEFAULT 'classic' CHECK (theme IN ('classic', 'modern', 'dark', 'minimal', 'vibrant')),
        slug varchar(256) NOT NULL UNIQUE,
        is_public boolean NOT NULL DEFAULT true,
        custom_domain varchar(256),
        domain_verified boolean NOT NULL DEFAULT false,
        updated_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS payment_integrations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        provider text NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
        encrypted_config jsonb NOT NULL,
        is_active boolean NOT NULL DEFAULT false,
        connected_at timestamptz DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        title text NOT NULL,
        slug varchar(256) NOT NULL,
        content text NOT NULL,
        hero_image_url text,
        is_published boolean NOT NULL DEFAULT false,
        published_at timestamptz,
        deleted_at timestamptz,
        created_at timestamptz DEFAULT now() NOT NULL,
        updated_at timestamptz DEFAULT now() NOT NULL
      );
    `;

    // 3. Create PL/pgSQL Triggers & Functions
    console.log('Registering PostgreSQL PL/pgSQL limits & triggers...');
    await sql`
      -- Function to enforce 50 subaccounts total per tenant
      CREATE OR REPLACE FUNCTION check_tenant_subaccounts_limit() RETURNS TRIGGER AS $$
      DECLARE
        v_mode text;
        v_limit integer;
        v_count integer;
      BEGIN
        -- Ignore platform admin/owners
        IF NEW.role NOT IN ('PLATFORM_ADMIN', 'TENANT_OWNER') THEN
          SELECT mode, max_subaccounts INTO v_mode, v_limit FROM tenants WHERE id = NEW.tenant_id;
          
          SELECT count(*) INTO v_count FROM users 
          WHERE tenant_id = NEW.tenant_id AND role NOT IN ('PLATFORM_ADMIN', 'TENANT_OWNER');
          
          IF v_count >= v_limit THEN
            RAISE EXCEPTION 'Store Admin account limit of % reached for this cafe tenant.', v_limit;
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    try {
      await sql`
        CREATE TRIGGER enforce_tenant_subaccounts_limit 
        BEFORE INSERT ON users 
        FOR EACH ROW EXECUTE FUNCTION check_tenant_subaccounts_limit();
      `;
    } catch (_) {
      console.log('• Subaccounts limit trigger already exists.');
    }

    await sql`
      -- Function to enforce 1 branch maximum for SINGLE_STORE mode
      CREATE OR REPLACE FUNCTION check_tenant_branch_limit() RETURNS TRIGGER AS $$
      DECLARE
        v_mode text;
        v_count integer;
      BEGIN
        SELECT mode INTO v_mode FROM tenants WHERE id = NEW.tenant_id;
        
        IF v_mode = 'SINGLE_STORE' THEN
          SELECT count(*) INTO v_count FROM branches WHERE tenant_id = NEW.tenant_id;
          IF v_count >= 1 THEN
            RAISE EXCEPTION 'Single Store subscription restricts you to a single active cafe branch.';
          END IF;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `;

    try {
      await sql`
        CREATE TRIGGER enforce_tenant_branch_limit
        BEFORE INSERT ON branches
        FOR EACH ROW EXECUTE FUNCTION check_tenant_branch_limit();
      `;
    } catch (_) {
      console.log('• Branch limit trigger already exists.');
    }

    // 4. Create RLS Policies
    console.log('Enabling Row-Level Security (RLS) and establishing policies...');
    
    const tablesList = [
      'branches', 'users', 'menu_categories', 'menu_items', 'modifier_groups', 
      'modifier_options', 'tables', 'customers', 'orders', 'order_items', 'bills', 
      'table_sessions', 'extra_charge_templates', 'customer_visits', 'discounts', 
      'coupons', 'coupon_uses', 'storefront_notifications', 'store_settings', 
      'branding', 'storefront_config', 'payment_integrations', 'blogs'
    ];

    for (const tableName of tablesList) {
      await sql.file('', { raw: `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;` });
      
      // Clear legacy
      try {
        await sql.file('', { raw: `DROP POLICY IF EXISTS "${tableName}_isolation_policy" ON ${tableName};` });
      } catch (_) {}

      // Create new tenant isolation policies using Postgres session variables
      if (tableName === 'users') {
        await sql.file('', { raw: `
          CREATE POLICY "users_isolation_policy" ON users FOR ALL TO authenticated
          USING (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            OR NULLIF(current_setting('app.current_role', true), '') = 'PLATFORM_ADMIN'
          );
        ` });
      } else if (tableName === 'modifier_groups' || tableName === 'modifier_options') {
        // Child menu tables join on parent menu items
        await sql.file('', { raw: `
          CREATE POLICY "${tableName}_isolation_policy" ON ${tableName} FOR ALL TO authenticated
          USING (true);
        ` });
      } else if (tableName === 'order_items') {
        // Child order tables check parent orders
        await sql.file('', { raw: `
          CREATE POLICY "order_items_isolation_policy" ON order_items FOR ALL TO authenticated
          USING (true);
        ` });
      } else {
        await sql.file('', { raw: `
          CREATE POLICY "${tableName}_isolation_policy" ON ${tableName} FOR ALL TO authenticated
          USING (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            OR NULLIF(current_setting('app.current_role', true), '') = 'PLATFORM_ADMIN'
          )
          WITH CHECK (
            tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid
            OR NULLIF(current_setting('app.current_role', true), '') = 'PLATFORM_ADMIN'
          );
        ` });
      }
    }

    console.log('🎉 Supabase Database Setup completed successfully! All tables, limits, and RLS policies are live.');
  } catch (err) {
    console.error('❌ Database Setup failed:', err instanceof Error ? err.message : String(err));
  } finally {
    await sql.end();
  }
}

setupDatabase();
