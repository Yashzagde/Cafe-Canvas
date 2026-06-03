'use server';

import { requirePermission } from '@/lib/rbac';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';

/**
 * Fetch paginated audit logs for the current tenant.
 * Only owners and managers are allowed.
 * @param pageIndex - The page index (0-indexed)
 * @param pageSize - The number of records per page
 * @returns Array of audit log rows and total count
 */
export async function getAuditLogsAction(pageIndex: number = 0, pageSize: number = 20) {
  const profile = await requirePermission('audit.view');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const fromIndex = pageIndex * pageSize;
  const toIndex = fromIndex + pageSize - 1;

  const { data, count, error } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .range(fromIndex, toIndex);

  if (error) {
    throw new Error(error.message);
  }

  return { data, count: count || 0 };
}
