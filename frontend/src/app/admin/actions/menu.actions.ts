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
    .select('*, modifier_options(*), menu_item_modifier_groups(item_id)')
    .eq('tenant_id', profile.tenant_id)
    .order('name', { ascending: true })
    .order('sort_order', { referencedTable: 'modifier_options', ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Deduplicate groups by id and aggregate their linked menu items
  const groupMap = new Map<string, any>();
  for (const row of (data || [])) {
    if (!groupMap.has(row.id)) {
      groupMap.set(row.id, {
        ...row,
        menu_item_modifier_groups: row.menu_item_modifier_groups 
          ? (Array.isArray(row.menu_item_modifier_groups) 
              ? row.menu_item_modifier_groups 
              : [row.menu_item_modifier_groups])
          : []
      });
    } else {
      const existing = groupMap.get(row.id);
      if (row.menu_item_modifier_groups) {
        const itemArray = Array.isArray(row.menu_item_modifier_groups) 
          ? row.menu_item_modifier_groups 
          : [row.menu_item_modifier_groups];
        existing.menu_item_modifier_groups = [
          ...existing.menu_item_modifier_groups,
          ...itemArray
        ];
      }
    }
  }

  // Deduplicate list of item links by item_id inside each group
  const finalGroups = Array.from(groupMap.values()).map(group => {
    const seenItems = new Set<string>();
    const uniqueLinks = (group.menu_item_modifier_groups || []).filter((link: any) => {
      if (!link || !link.item_id) return false;
      if (seenItems.has(link.item_id)) return false;
      seenItems.add(link.item_id);
      return true;
    });
    return {
      ...group,
      menu_item_modifier_groups: uniqueLinks
    };
  });

  return finalGroups;
}

/**
 * Create a new reusable modifier group and link it to items.
 */
export async function createModifierGroupAction(
  insertData: Omit<Database['public']['Tables']['modifier_groups']['Insert'], 'tenant_id'>,
  itemIds?: string[]
) {
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

  // Insert mapping relations if itemIds are specified
  if (itemIds && itemIds.length > 0) {
    const relations = itemIds.map(itemId => ({
      item_id: itemId,
      modifier_group_id: data.id,
      is_required: insertData.min_selections ? insertData.min_selections > 0 : false,
      sort_order: 0
    }));

    const { error: relError } = await supabase
      .from('menu_item_modifier_groups')
      .insert(relations);

    if (relError) {
      console.error("Failed to link modifier group to menu items:", relError.message);
    }
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

/**
 * Fetch all menu items for the tenant to link with modifier groups.
 */
export async function getMenuItemsForModifiersAction() {
  const profile = await requirePermission('modifier.view');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('tenant_id', profile.tenant_id)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a modifier group.
 */
export async function deleteModifierGroupAction(id: string) {
  const profile = await requirePermission('modifier.delete');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { error } = await supabase
    .from('modifier_groups')
    .delete()
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'modifier_group.delete',
    entityType: 'modifier_group',
    entityId: id,
    newData: undefined
  });

  return { success: true };
}

/**
 * Delete a modifier option.
 */
export async function deleteModifierOptionAction(id: string) {
  const profile = await requirePermission('modifier.delete');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { error } = await supabase
    .from('modifier_options')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'modifier_option.delete',
    entityType: 'modifier_option',
    entityId: id,
    newData: undefined
  });

  return { success: true };
}


