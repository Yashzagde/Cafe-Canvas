const { createClient } = require('@supabase/supabase-js');
const postgres = require('postgres');

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcmluZ2dkYnhtbWloZ3Z1eWZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk0OTQ0MCwiZXhwIjoyMDk1NTI1NDQwfQ.veRT7OKwqcrmfp9CuQMwjEnczFM-mgd9494l-TyLfPg';
const supabaseUrl = 'https://oeringgdbxmmihgvuyfa.supabase.co';
const dbUrl = 'postgresql://postgres.oeringgdbxmmihgvuyfa:XASzdcFrmbyXuGOn@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const sql = postgres(dbUrl, {
  ssl: 'require',
  connect_timeout: 10,
  max: 1,
});

const demoTenantId = 'a0000000-0000-0000-0000-000000000001';

async function run() {
  console.log("=== STEP 1: Fetching and Deleting Auth Users linked to Demo Tenant ===");
  try {
    // Fetch users of demo tenant
    const { data: tenantUsers, error: fetchError } = await admin
      .from('users')
      .select('id, email, name')
      .eq('tenant_id', demoTenantId);

    if (fetchError) {
      console.error("Failed to fetch tenant users:", fetchError.message);
    } else {
      console.log(`Found ${tenantUsers.length} users to delete from auth:`);
      for (const u of tenantUsers) {
        if (u.id === 'a0000000-0000-0000-0000-000000000099') {
          console.log(`Skipping protection check: Super Admin user ${u.email} [${u.id}] must not be deleted.`);
          continue;
        }
        console.log(`- Deleting user ${u.name} (${u.email}) [ID: ${u.id}]`);
        const { error: authDelError } = await admin.auth.admin.deleteUser(u.id);
        if (authDelError) {
          console.error(`Error deleting auth user ${u.id}:`, authDelError.message);
        } else {
          console.log(`Successfully deleted auth user ${u.id}`);
        }
      }
    }

    console.log("\n=== STEP 2: Running SQL Transaction to Delete Demo Records ===");
    
    await sql.begin(async (sqlTrans) => {
      // 1. Delete modifier options (linked via modifier_groups and menu_items)
      console.log("1. Deleting modifier_options...");
      const delModOptions = await sqlTrans`
        DELETE FROM public.modifier_options 
        WHERE group_id IN (
          SELECT mg.id FROM public.modifier_groups mg 
          JOIN public.menu_items mi ON mg.item_id = mi.id
          WHERE mi.tenant_id = ${demoTenantId}
        );
      `;
      console.log(`   Deleted ${delModOptions.count} options.`);

      // 2. Delete modifier groups (linked via menu_items)
      console.log("2. Deleting modifier_groups...");
      const delModGroups = await sqlTrans`
        DELETE FROM public.modifier_groups 
        WHERE item_id IN (
          SELECT id FROM public.menu_items 
          WHERE tenant_id = ${demoTenantId}
        );
      `;
      console.log(`   Deleted ${delModGroups.count} groups.`);

      // 3. Delete order items (linked via orders)
      console.log("3. Deleting order_items...");
      const delOrderItems = await sqlTrans`
        DELETE FROM public.order_items 
        WHERE order_id IN (
          SELECT id FROM public.orders 
          WHERE tenant_id = ${demoTenantId}
        );
      `;
      console.log(`   Deleted ${delOrderItems.count} order items.`);

      // 4. Delete bills
      console.log("4. Deleting bills...");
      const delBills = await sqlTrans`
        DELETE FROM public.bills 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delBills.count} bills.`);

      // 5. Delete orders
      console.log("5. Deleting orders...");
      const delOrders = await sqlTrans`
        DELETE FROM public.orders 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delOrders.count} orders.`);

      // 6. Delete staff calls
      console.log("6. Deleting staff_calls...");
      const delStaffCalls = await sqlTrans`
        DELETE FROM public.staff_calls 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delStaffCalls.count} staff calls.`);

      // 7. Delete table sessions
      console.log("7. Deleting table_sessions...");
      const delTableSessions = await sqlTrans`
        DELETE FROM public.table_sessions 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delTableSessions.count} table sessions.`);

      // 8. Delete tables
      console.log("8. Deleting tables...");
      const delTables = await sqlTrans`
        DELETE FROM public.tables 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delTables.count} tables.`);

      // 9. Delete menu items
      console.log("9. Deleting menu_items...");
      const delMenuItems = await sqlTrans`
        DELETE FROM public.menu_items 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delMenuItems.count} menu items.`);

      // 10. Delete menu categories
      console.log("10. Deleting menu_categories...");
      const delMenuCategories = await sqlTrans`
        DELETE FROM public.menu_categories 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delMenuCategories.count} categories.`);

      // 11. Delete store settings
      console.log("11. Deleting store_settings...");
      const delStoreSettings = await sqlTrans`
        DELETE FROM public.store_settings 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delStoreSettings.count} store settings.`);

      // 12. Delete storefront config
      console.log("12. Deleting storefront_config...");
      const delStorefrontConfig = await sqlTrans`
        DELETE FROM public.storefront_config 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delStorefrontConfig.count} storefront configurations.`);

      // 13. Delete blogs (if table exists)
      console.log("13. Deleting blogs...");
      const delBlogs = await sqlTrans`
        DELETE FROM public.blogs 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delBlogs.count} blogs.`);

      // 14. Delete google review cache (if table exists)
      console.log("14. Deleting google_review_cache...");
      const delReviewCache = await sqlTrans`
        DELETE FROM public.google_review_cache 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delReviewCache.count} cached reviews.`);

      // 15. Delete attendance (if table exists)
      console.log("15. Deleting attendance...");
      const delAttendance = await sqlTrans`
        DELETE FROM public.attendance 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delAttendance.count} attendance records.`);

      // 16. Delete notification log (if table exists)
      console.log("16. Deleting notification_log...");
      const delNotificationLog = await sqlTrans`
        DELETE FROM public.notification_log 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delNotificationLog.count} notification logs.`);

      // 17. Delete user profiles (users table) for this tenant (excluding super admin 'a0000000-0000-0000-0000-000000000099')
      console.log("17. Deleting user profiles...");
      const delUserProfiles = await sqlTrans`
        DELETE FROM public.users 
        WHERE tenant_id = ${demoTenantId} 
          AND id != 'a0000000-0000-0000-0000-000000000099';
      `;
      console.log(`   Deleted ${delUserProfiles.count} user profiles.`);

      // 18. Delete branches
      console.log("18. Deleting branches...");
      const delBranches = await sqlTrans`
        DELETE FROM public.branches 
        WHERE tenant_id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delBranches.count} branches.`);

      // 19. Delete tenants
      console.log("19. Deleting tenant...");
      const delTenant = await sqlTrans`
        DELETE FROM public.tenants 
        WHERE id = ${demoTenantId};
      `;
      console.log(`   Deleted ${delTenant.count} tenant.`);
    });

    console.log("\n=== SUCCESS: Demo Tenant Data has been completely removed! ===");

  } catch (error) {
    console.error("Clean-up failed:", error.message || error);
  } finally {
    await sql.end();
  }
}

run();
