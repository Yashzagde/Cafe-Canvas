const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oeringgdbxmmihgvuyfa.supabase.co',
  'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU'
);

async function run() {
  console.log("Logging in as admin@cafecanvas.com...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@cafecanvas.com',
    password: 'password123'
  });

  if (authErr) {
    console.error("Auth login failed:", authErr.message);
    return;
  }

  const user = authData.user;
  console.log("Login success! User ID:", user.id);
  console.log("App Metadata:", user.app_metadata);
  
  let activeTenantId = 'a0000000-0000-0000-0000-000000000001';
  if (user.app_metadata && user.app_metadata.tenant_id) {
    activeTenantId = user.app_metadata.tenant_id;
  }
  console.log("Using Active Tenant ID:", activeTenantId);

  const queries = [
    {
      name: 'tenants',
      run: () => supabase.from('tenants').select('name').eq('id', activeTenantId).maybeSingle()
    },
    {
      name: 'menu_categories',
      run: () => supabase.from('menu_categories').select('id, name').eq('tenant_id', activeTenantId).is('deleted_at', null)
    },
    {
      name: 'menu_items',
      run: () => supabase.from('menu_items').select('id, name, price, status, description, category_id').eq('tenant_id', activeTenantId).is('deleted_at', null)
    },
    {
      name: 'tables',
      run: () => supabase.from('tables').select('id, name, capacity, section, status').eq('tenant_id', activeTenantId).is('deleted_at', null)
    },
    {
      name: 'orders',
      run: () => supabase.from('orders').select(`
        id,
        table_id,
        status,
        created_at,
        total,
        order_items (
          id,
          menu_item_id,
          item_name,
          unit_price,
          quantity
        )
      `).eq('tenant_id', activeTenantId).in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed'])
    },
    {
      name: 'bills',
      run: () => supabase.from('bills').select('*').eq('tenant_id', activeTenantId).limit(10)
    },
    {
      name: 'customers',
      run: () => supabase.from('customers').select('*').eq('tenant_id', activeTenantId).is('deleted_at', null).limit(20)
    }
  ];

  for (const q of queries) {
    console.log(`\nQuerying ${q.name}...`);
    const { data, error } = await q.run();
    if (error) {
      console.error(`❌ Query ${q.name} failed:`, error.message, error.details || '');
    } else {
      console.log(`✓ Query ${q.name} success. Results:`, data ? (Array.isArray(data) ? data.length : '1 object') : 'null');
    }
  }
}

run();
