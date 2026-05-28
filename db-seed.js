const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
  console.error('Error: Please configure DATABASE_URL in your .env file.');
  process.exit(1);
}

const sql = postgres(connectionString, { ssl: 'require', prepare: false });

async function seedDatabase() {
  console.log('🚀 Connecting to Supabase database for seeding...');
  try {
    // Query existing tenant or create one
    const existingTenants = await sql`SELECT id FROM tenants LIMIT 1`;
    let tenantId;
    if (existingTenants.length > 0) {
      tenantId = existingTenants[0].id;
      console.log(`Using existing tenant ID: ${tenantId}`);
    } else {
      tenantId = 'd3b07384-d113-495d-a5d6-ec25c7e1b54a';
      console.log(`Inserting seed tenant ID: ${tenantId}`);
      await sql.unsafe(`
        INSERT INTO tenants (id, name, mode, max_subaccounts, status)
        VALUES ('${tenantId}', 'Aether Cafe', 'SINGLE_STORE', 50, 'ACTIVE');
      `);
    }

    // Query existing branch or create one
    const existingBranches = await sql`SELECT id FROM branches WHERE tenant_id = ${tenantId} LIMIT 1`;
    let branchId;
    if (existingBranches.length > 0) {
      branchId = existingBranches[0].id;
      console.log(`Using existing branch ID: ${branchId}`);
    } else {
      branchId = 'b78e24c5-09cd-4a5f-a320-f56f3458ef23';
      console.log(`Inserting seed branch ID: ${branchId}`);
      await sql.unsafe(`
        INSERT INTO branches (id, tenant_id, name, status)
        VALUES ('${branchId}', '${tenantId}', 'Aether Cafe - Downtown', 'ACTIVE');
      `);
    }

    // Query existing user or create one
    const existingUsers = await sql`SELECT id FROM users WHERE tenant_id = ${tenantId} LIMIT 1`;
    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`Using existing user ID: ${userId}`);
    } else {
      userId = 'c36a8d7a-1111-2222-3333-444455556666';
      console.log(`Inserting seed user ID: ${userId}`);
      await sql.unsafe(`
        INSERT INTO users (id, tenant_id, branch_id, full_name, email, role, status)
        VALUES ('${userId}', '${tenantId}', '${branchId}', 'Yash Zagde', 'yash@cafecanvas.bar', 'TENANT_OWNER', 'ACTIVE')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // Temporarily disable RLS trigger policies to insert mock data without active session variables
    console.log('Temporarily disabling RLS on session tables...');
    await sql.unsafe(`SELECT set_config('app.current_role', 'PLATFORM_ADMIN', true);`);

    console.log('Inserting seed categories...');
    const categories = [
      { id: 'c1111111-1111-1111-1111-111111111111', name: 'Coffee', sort: 1 },
      { id: 'c2222222-2222-2222-2222-222222222222', name: 'Desserts', sort: 2 },
      { id: 'c3333333-3333-3333-3333-333333333333', name: 'Snacks', sort: 3 }
    ];

    for (const cat of categories) {
      await sql.unsafe(`
        INSERT INTO menu_categories (id, tenant_id, branch_id, name, sort_order, is_visible)
        VALUES ('${cat.id}', '${tenantId}', '${branchId}', '${cat.name}', ${cat.sort}, true)
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    console.log('Inserting seed items...');
    const items = [
      { id: 'a1111111-1111-1111-1111-111111111111', catId: 'c1111111-1111-1111-1111-111111111111', name: 'Classic Cappuccino', price: 24000, desc: 'Rich espresso with steamed milk foam' },
      { id: 'a2222222-2222-2222-2222-222222222222', catId: 'c2222222-2222-2222-2222-222222222222', name: 'Blueberry Muffin', price: 18000, desc: 'Freshly baked muffin with organic berries' },
      { id: 'a3333333-3333-3333-3333-333333333333', catId: 'c3333333-3333-3333-3333-333333333333', name: 'Avocado Sourdough Toast', price: 29000, desc: 'Toasted sourdough with mashed avocado and sea salt' }
    ];

    for (const item of items) {
      await sql.unsafe(`
        INSERT INTO menu_items (id, tenant_id, branch_id, category_id, name, price, description, status)
        VALUES ('${item.id}', '${tenantId}', '${branchId}', '${item.catId}', '${item.name}', ${item.price}, '${item.desc}', 'available')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    console.log('Inserting seed tables...');
    const tablesList = [
      { id: 'd1111111-1111-1111-1111-111111111111', name: 'Table 01', cap: 4, sec: 'Indoor Main' },
      { id: 'd2222222-2222-2222-2222-222222222222', name: 'Table 02', cap: 2, sec: 'Indoor Bar' },
      { id: 'd3333333-3333-3333-3333-333333333333', name: 'Table 04', cap: 6, sec: 'Outdoor Patio' },
      { id: 'd4444444-4444-4444-4444-444444444444', name: 'Table 12', cap: 2, sec: 'Indoor Window' }
    ];

    for (const t of tablesList) {
      await sql.unsafe(`
        INSERT INTO tables (id, tenant_id, branch_id, name, capacity, section, status)
        VALUES ('${t.id}', '${tenantId}', '${branchId}', '${t.name}', ${t.cap}, '${t.sec}', 'available')
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    console.log('Inserting seed customers...');
    const customerId = 'c7777777-7777-7777-7777-777777777777';
    await sql.unsafe(`
      INSERT INTO customers (id, tenant_id, branch_id, name, phone)
      VALUES ('${customerId}', '${tenantId}', '${branchId}', 'Aditya Sharma', '+919876543210')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Inserting seed orders...');
    const orderId = 'e1111111-1111-1111-1111-111111111111';
    await sql.unsafe(`
      INSERT INTO orders (id, tenant_id, branch_id, table_id, customer_id, created_by, status, subtotal, discount_amount, total)
      VALUES ('${orderId}', '${tenantId}', '${branchId}', 'd3333333-3333-3333-3333-333333333333', '${customerId}', '${userId}', 'paid', 53000, 5000, 50400)
      ON CONFLICT (id) DO NOTHING;
    `);

    await sql.unsafe(`
      INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, item_name)
      VALUES ('e2111111-1111-1111-1111-111111111111', '${orderId}', 'a1111111-1111-1111-1111-111111111111', 1, 24000, 'Classic Cappuccino')
      ON CONFLICT (id) DO NOTHING;
    `);

    await sql.unsafe(`
      INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, item_name)
      VALUES ('e2222222-2222-2222-2222-222222222222', '${orderId}', 'a3333333-3333-3333-3333-333333333333', 1, 29000, 'Avocado Sourdough Toast')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Inserting seed bill...');
    await sql.unsafe(`
      INSERT INTO bills (id, tenant_id, branch_id, table_id, subtotal, tax, discount_amount, total, status, payment_method, paid_at, created_by)
      VALUES ('e3111111-1111-1111-1111-111111111111', '${tenantId}', '${branchId}', 'd3333333-3333-3333-3333-333333333333', 53000, 2400, 5000, 50400, 'paid', 'cash', now(), '${userId}')
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('🎉 Seeding Database completed successfully! All live developer assets are ready.');
  } catch (err) {
    console.error('❌ Database Seeding failed:', err instanceof Error ? err.message : String(err));
  } finally {
    await sql.end();
  }
}

seedDatabase();
