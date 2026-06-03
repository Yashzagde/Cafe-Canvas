'use server';

import { requirePermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';

/**
 * Fetch all tables in the current branch.
 * Only authenticated users with permission.
 */
export async function getTablesAction(branchId: string) {
  const profile = await requirePermission('table.view');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .eq('branch_id', branchId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new table in the floor layout.
 */
export async function createTableAction(insertData: Omit<Database['public']['Tables']['tables']['Insert'], 'tenant_id'>) {
  const profile = await requirePermission('table.create');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('tables')
    .insert({
      ...insertData,
      tenant_id: profile.tenant_id,
      qr_version: 1,
      qr_generated_at: new Date().toISOString()
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
    action: 'table.create',
    entityType: 'table',
    entityId: data.id,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Update a table configuration.
 */
export async function updateTableAction(tableId: string, updateData: Partial<Database['public']['Tables']['tables']['Update']>) {
  const profile = await requirePermission('table.update');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data: oldData } = await supabase
    .from('tables')
    .select('*')
    .eq('id', tableId)
    .eq('tenant_id', profile.tenant_id)
    .single();

  const { data: newData, error } = await supabase
    .from('tables')
    .update(updateData)
    .eq('id', tableId)
    .eq('tenant_id', profile.tenant_id)
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
    action: 'table.update',
    entityType: 'table',
    entityId: tableId,
    oldData: oldData ? (oldData as Record<string, unknown>) : undefined,
    newData: newData ? (newData as Record<string, unknown>) : undefined
  });

  return newData;
}

/**
 * Save rearranged coordinates for multiple tables.
 */
export async function rearrangeTablesAction(positions: { id: string; floor_x: number; floor_y: number }[]) {
  const profile = await requirePermission('table.update');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  for (const pos of positions) {
    await supabase
      .from('tables')
      .update({
        floor_x: pos.floor_x,
        floor_y: pos.floor_y
      })
      .eq('id', pos.id)
      .eq('tenant_id', profile.tenant_id);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'table.floor_rearrange',
    entityType: 'table',
    metadata: { tablesCount: positions.length }
  });

  return { success: true };
}

/**
 * Regenerate table QR (invalidating old QR tokens).
 */
export async function regenerateTableQRAction(tableId: string) {
  const profile = await requirePermission('table.qr_generate');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data: oldData } = await supabase
    .from('tables')
    .select('id, qr_version')
    .eq('id', tableId)
    .eq('tenant_id', profile.tenant_id)
    .single();

  const { error } = await supabase.rpc('invalidate_table_qr', { p_table_id: tableId });

  if (error) {
    throw new Error(error.message);
  }

  const { data: newData } = await supabase
    .from('tables')
    .select('id, qr_version, qr_generated_at')
    .eq('id', tableId)
    .single();

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'table.qr_regenerate',
    entityType: 'table',
    entityId: tableId,
    oldData: oldData ? (oldData as Record<string, unknown>) : undefined,
    newData: newData ? (newData as Record<string, unknown>) : undefined
  });

  return newData;
}

/**
 * Soft delete a table from the floor layout.
 */
export async function deleteTableAction(tableId: string) {
  const profile = await requirePermission('table.delete');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data: oldData } = await supabase
    .from('tables')
    .select('*')
    .eq('id', tableId)
    .eq('tenant_id', profile.tenant_id)
    .single();

  const { data: newData, error } = await supabase
    .from('tables')
    .update({
      deleted_at: new Date().toISOString()
    })
    .eq('id', tableId)
    .eq('tenant_id', profile.tenant_id)
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
    action: 'table.delete',
    entityType: 'table',
    entityId: tableId,
    oldData: oldData ? (oldData as Record<string, unknown>) : undefined,
    newData: newData ? (newData as Record<string, unknown>) : undefined
  });

  return newData;
}
