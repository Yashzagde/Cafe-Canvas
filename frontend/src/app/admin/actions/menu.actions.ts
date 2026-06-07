'use server';

import { requirePermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';
import { revalidateTag } from 'next/cache';

/**
 * Fetch reusable modifier groups for the tenant.
 */
export async function getModifierGroupsAction() {
  const profile = await requirePermission('modifier.view');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('modifier_groups')
    .select('*, modifier_options(*)')
    .eq('tenant_id', profile.tenant_id)
    .order('name', { ascending: true })
    .order('sort_order', { referencedTable: 'modifier_options', ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new reusable modifier group.
 */
export async function createModifierGroupAction(insertData: Omit<Database['public']['Tables']['modifier_groups']['Insert'], 'tenant_id'>) {
  const profile = await requirePermission('modifier.create');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('modifier_groups')
    .insert({
      ...insertData,
      tenant_id: profile.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'modifier_group.create',
    entityType: 'modifier_group',
    entityId: data.id,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Create a new option inside a modifier group.
 */
export async function createModifierOptionAction(insertData: Omit<Database['public']['Tables']['modifier_options']['Insert'], 'tenant_id'>) {
  const profile = await requirePermission('modifier.create');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('modifier_options')
    .insert({
      ...insertData,
      tenant_id: profile.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'modifier_option.create',
    entityType: 'modifier_option',
    entityId: data.id,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Link a menu item to a reusable modifier group.
 */
export async function linkModifierGroupToItemAction(itemId: string, groupId: string, isRequired: boolean = false, sortOrder: number = 0) {
  const profile = await requirePermission('modifier.update');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('menu_item_modifier_groups')
    .insert({
      item_id: itemId,
      modifier_group_id: groupId,
      is_required: isRequired,
      sort_order: sortOrder
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  (revalidateTag as any)(`menu-${profile.tenant_id}`);
  return data;
}
