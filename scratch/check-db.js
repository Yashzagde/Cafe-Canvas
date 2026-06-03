const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oeringgdbxmmihgvuyfa.supabase.co',
  'sb_publishable_laWLW3mZrK5wdSh115u2Dw_7K0BIjYU'
);

async function run() {
  console.log("Checking schema using RPC or system queries...");
  
  const tablesToCheck = [
    'users', 'tenants', 'branches', 'menu_categories', 'menu_items', 
    'tables', 'table_sessions', 'orders', 'order_items', 'bills', 
    'staff_calls', 'customers', 'discounts', 'coupons', 'store_settings', 
    'storefront_config', 'blogs', 'payment_integrations', 'attendance', 
    'notification_log'
  ];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table '${table}' failed:`, error.message);
    } else {
      console.log(`Table '${table}' exists! Query success.`);
    }
  }
}

run();
