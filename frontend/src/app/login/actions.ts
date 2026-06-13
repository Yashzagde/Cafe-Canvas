'use server';

import { createAdminClient } from '@/utils/supabase/admin';

export async function getStaffByStoreSlug(storeSlug: string) {
  if (!storeSlug) {
    throw new Error('Store code (slug) is required.');
  }

  const admin = createAdminClient();
  if (!admin) {
    throw new Error('Database admin client initialization failed.');
  }

  // 1. Fetch tenant ID by slug
  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .select('id, name')
    .eq('slug', storeSlug.toLowerCase().trim())
    .maybeSingle();

  if (tenantError) {
    throw new Error(`Failed to query store: ${tenantError.message}`);
  }

  if (!tenant) {
    throw new Error('Store not found. Please verify the store code.');
  }

  // 2. Fetch staff accounts for that tenant
  const { data: staff, error: staffError } = await admin
    .from('users')
    .select('id, name, email, role')
    .eq('tenant_id', tenant.id)
    .eq('active', true)
    .order('name', { ascending: true });

  if (staffError) {
    throw new Error(`Failed to load staff accounts: ${staffError.message}`);
  }

  return {
    tenantId: tenant.id,
    tenantName: tenant.name,
    staffList: staff || [],
  };
}
