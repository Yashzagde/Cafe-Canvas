const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oeringgdbxmmihgvuyfa.supabase.co',
  'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU'
);

const activeTenantId = 'a0000000-0000-0000-0000-000000000001'; // SEED_TENANT_ID

async function run() {
  console.log("Starting diagnostic database queries matching the admin dashboard...");

  try {
    // Query 1: Tenants
    console.log("\n1. Querying tenants...");
    const { data: tenData, error: tenErr } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', activeTenantId)
      .maybeSingle();
    if (tenErr) console.error("Tenant Error:", tenErr.message);
    else console.log("Tenant Success:", tenData);

    // Query 2: Menu Categories
    console.log("\n2. Querying menu_categories...");
    const { data: catData, error: catErr } = await supabase
      .from('menu_categories')
      .select('id, name')
      .eq('tenant_id', activeTenantId)
      .is('deleted_at', null);
    if (catErr) console.error("Categories Error:", catErr.message);
    else console.log("Categories Success, count:", catData ? catData.length : 0);

    // Query 3: Menu Items
    console.log("\n3. Querying menu_items...");
    const { data: itemsData, error: itemsErr } = await supabase
      .from('menu_items')
      .select('id, name, price, status, description, category_id')
      .eq('tenant_id', activeTenantId)
      .is('deleted_at', null);
    if (itemsErr) console.error("Menu Items Error:", itemsErr.message);
    else console.log("Menu Items Success, count:", itemsData ? itemsData.length : 0);

    // Query 4: Tables
    console.log("\n4. Querying tables...");
    const { data: tableData, error: tableErr } = await supabase
      .from('tables')
      .select('id, name, capacity, section, status')
      .eq('tenant_id', activeTenantId)
      .is('deleted_at', null);
    if (tableErr) console.error("Tables Error:", tableErr.message);
    else console.log("Tables Success, count:", tableData ? tableData.length : 0);

    // Query 5: Active Orders & Items
    console.log("\n5. Querying active orders & items...");
    const { data: activeOrders, error: actOrdErr } = await supabase
      .from('orders')
      .select(`
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
      `)
      .eq('tenant_id', activeTenantId)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed']);
    if (actOrdErr) console.error("Orders Error:", actOrdErr.message);
    else console.log("Orders Success, count:", activeOrders ? activeOrders.length : 0);

    // Query 6: Bills
    console.log("\n6. Querying bills...");
    const { data: billsData, error: billsErr } = await supabase
      .from('bills')
      .select('*')
      .eq('tenant_id', activeTenantId)
      .limit(10);
    if (billsErr) console.error("Bills Error:", billsErr.message);
    else console.log("Bills Success, count:", billsData ? billsData.length : 0);

    // Query 7: Customers
    console.log("\n7. Querying customers...");
    const { data: custData, error: custErr } = await supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', activeTenantId)
      .is('deleted_at', null)
      .limit(20);
    if (custErr) console.error("Customers Error:", custErr.message);
    else console.log("Customers Success, count:", custData ? custData.length : 0);

  } catch (e) {
    console.error("Diagnostic threw unexpected exception:", e);
  }
}

run();
