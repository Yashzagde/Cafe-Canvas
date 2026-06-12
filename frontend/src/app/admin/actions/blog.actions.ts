'use server';

import { requirePermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';
import { revalidateTag } from 'next/cache';

/** Create an authenticated Supabase server client */
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );
}

/**
 * Fetch all storefront blog posts for the active tenant.
 */
export async function getBlogsAction() {
  const profile = await requirePermission('storefront.view');
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('storefront_blogs')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('published_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Create a new storefront blog post.
 */
export async function createBlogAction(
  insertData: Omit<Database['public']['Tables']['storefront_blogs']['Insert'], 'tenant_id'>
) {
  const profile = await requirePermission('storefront.edit');
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('storefront_blogs')
    .insert({
      ...insertData,
      tenant_id: profile.tenant_id
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Audit event log
  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'storefront.update',
    entityType: 'storefront',
    entityId: data.id,
    newData: data as Record<string, unknown>
  });

  (revalidateTag as any)(`storefront-${profile.tenant_id}`);
  return data;
}

/**
 * Update an existing storefront blog post.
 */
export async function updateBlogAction(
  id: string,
  updateData: Partial<Omit<Database['public']['Tables']['storefront_blogs']['Update'], 'tenant_id'>>
) {
  const profile = await requirePermission('storefront.edit');
  const supabase = await getSupabase();

  // Fetch current details for audit logging
  const { data: oldData } = await supabase
    .from('storefront_blogs')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (!oldData) {
    throw new Error('Blog post not found.');
  }

  // Clean data to exclude protected fields
  const cleanData = { ...updateData };
  delete (cleanData as any).tenant_id;
  delete (cleanData as any).id;

  const { data: newData, error } = await supabase
    .from('storefront_blogs')
    .update(cleanData)
    .eq('id', id)
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
    entityId: id,
    oldData: oldData as Record<string, unknown>,
    newData: newData as Record<string, unknown>
  });

  (revalidateTag as any)(`storefront-${profile.tenant_id}`);
  return newData;
}

/**
 * Delete a storefront blog post.
 */
export async function deleteBlogAction(id: string) {
  const profile = await requirePermission('storefront.edit');
  const supabase = await getSupabase();

  // Fetch current details for audit logging
  const { data: oldData } = await supabase
    .from('storefront_blogs')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id)
    .single();

  if (!oldData) {
    throw new Error('Blog post not found.');
  }

  const { error } = await supabase
    .from('storefront_blogs')
    .delete()
    .eq('id', id)
    .eq('tenant_id', profile.tenant_id);

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
    entityId: id,
    oldData: oldData as Record<string, unknown>
  });

  (revalidateTag as any)(`storefront-${profile.tenant_id}`);
  return true;
}
