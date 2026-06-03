'use server';

import { requirePermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';
import { revalidateTag } from 'next/cache';

/**
 * Fetch the storefront configuration for the active tenant.
 * Only owners and managers are allowed.
 * @returns StorefrontConfig row or null
 */
export async function getStorefrontConfigAction() {
  const profile = await requirePermission('storefront.view');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('storefront_config')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update the storefront configuration for the active tenant.
 * Only owners and managers are allowed.
 * @param configId - The UUID of the storefront config record
 * @param updateData - The fields to update
 * @returns Updated config row
 */
export async function updateStorefrontConfigAction(configId: string, updateData: Partial<Database['public']['Tables']['storefront_config']['Update']>) {
  const profile = await requirePermission('storefront.edit');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  // Fetch current details for audit logging
  const { data: oldData } = await supabase
    .from('storefront_config')
    .select('*')
    .eq('id', configId)
    .eq('tenant_id', profile.tenant_id)
    .single();

  const { data: newData, error } = await supabase
    .from('storefront_config')
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', configId)
    .eq('tenant_id', profile.tenant_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Audit event logs
  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'storefront.update',
    entityType: 'storefront',
    entityId: configId,
    oldData: oldData ? (oldData as Record<string, unknown>) : undefined,
    newData: newData ? (newData as Record<string, unknown>) : undefined
  });

  (revalidateTag as any)(`storefront-${profile.tenant_id}`);
  return newData;
}
