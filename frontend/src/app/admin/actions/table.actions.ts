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
    .eq('location_id', branchId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  // Map database columns to the branch_id/floor_x/floor_y types expected by the frontend
  return (data || []).map(t => ({
    ...t,
    branch_id: t.location_id,
    floor_x: t.position_x ?? 0,
    floor_y: t.position_y ?? 0,
  })) as unknown as Database['public']['Tables']['tables']['Row'][];
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

  const rawInsert = insertData as any;
  const dbPayload = {
    name: rawInsert.name,
    capacity: rawInsert.capacity,
    section: rawInsert.section,
    shape: rawInsert.shape || 'square',
    status: rawInsert.status || 'available',
    tenant_id: profile.tenant_id,
    location_id: rawInsert.branch_id || rawInsert.location_id,
    position_x: rawInsert.floor_x ?? rawInsert.position_x ?? 0,
    position_y: rawInsert.floor_y ?? rawInsert.position_y ?? 0,
    qr_version: 1,
    qr_generated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('tables')
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const mappedRow = {
    ...data,
    branch_id: data.location_id,
    floor_x: data.position_x ?? 0,
    floor_y: data.position_y ?? 0
  } as unknown as Database['public']['Tables']['tables']['Row'];

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

  return mappedRow;
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

  const rawUpdate = updateData as any;
  const dbUpdate: any = {};
  if (rawUpdate.name !== undefined) dbUpdate.name = rawUpdate.name;
  if (rawUpdate.capacity !== undefined) dbUpdate.capacity = rawUpdate.capacity;
  if (rawUpdate.section !== undefined) dbUpdate.section = rawUpdate.section;
  if (rawUpdate.shape !== undefined) dbUpdate.shape = rawUpdate.shape;
  if (rawUpdate.status !== undefined) dbUpdate.status = rawUpdate.status;
  if (rawUpdate.branch_id !== undefined) dbUpdate.location_id = rawUpdate.branch_id;
  if (rawUpdate.location_id !== undefined) dbUpdate.location_id = rawUpdate.location_id;
  if (rawUpdate.floor_x !== undefined) dbUpdate.position_x = rawUpdate.floor_x;
  if (rawUpdate.floor_y !== undefined) dbUpdate.position_y = rawUpdate.floor_y;
  if (rawUpdate.position_x !== undefined) dbUpdate.position_x = rawUpdate.position_x;
  if (rawUpdate.position_y !== undefined) dbUpdate.position_y = rawUpdate.position_y;
  if (rawUpdate.qr_version !== undefined) dbUpdate.qr_version = rawUpdate.qr_version;
  if (rawUpdate.qr_generated_at !== undefined) dbUpdate.qr_generated_at = rawUpdate.qr_generated_at;
  if (rawUpdate.deleted_at !== undefined) dbUpdate.deleted_at = rawUpdate.deleted_at;

  const { data: oldData } = await supabase
    .from('tables')
    .select('*')
    .eq('id', tableId)
    .eq('tenant_id', profile.tenant_id)
    .single();

  const { data: newData, error } = await supabase
    .from('tables')
    .update(dbUpdate)
    .eq('id', tableId)
    .eq('tenant_id', profile.tenant_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const mappedRow = {
    ...newData,
    branch_id: newData.location_id,
    floor_x: newData.position_x ?? 0,
    floor_y: newData.position_y ?? 0
  } as unknown as Database['public']['Tables']['tables']['Row'];

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

  return mappedRow;
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
        position_x: pos.floor_x,
        position_y: pos.floor_y
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

  const mappedRow = {
    ...newData,
    branch_id: newData.location_id,
    floor_x: newData.position_x ?? 0,
    floor_y: newData.position_y ?? 0
  } as unknown as Database['public']['Tables']['tables']['Row'];

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

  return mappedRow;
}
