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
 * Fetch the storefront configuration for the active tenant.
 * Only owners and managers are allowed.
 * @returns StorefrontConfig row or null
 */
export async function getStorefrontConfigAction() {
  const profile = await requirePermission('storefront.view');
  const supabase = await getSupabase();

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
  const supabase = await getSupabase();

  // Fetch current details for audit logging
  const { data: oldData } = await supabase
    .from('storefront_config')
    .select('*')
    .eq('id', configId)
    .eq('tenant_id', profile.tenant_id)
    .single();

  // Filter payload to only allowed database columns of storefront_config
  const allowedData: any = {};
  const allowedKeys = [
    'theme_id',
    'primary_color',
    'accent_color',
    'font_heading',
    'font_body',
    'banner_text',
    'show_prices',
    'allow_orders',
    'show_blog',
    'show_reviews',
    'show_instagram',
    'show_story',
    'hero_image_url',
    'hero_image_url_2',
    'hero_image_url_3',
    'logo_url',
    'footer_description',
    'footer_hours',
    'footer_address',
    'footer_phone',
    'footer_email',
    'hero_title',
    'hero_subtitle',
    'hero_title_2',
    'hero_subtitle_2',
    'hero_title_3',
    'hero_subtitle_3'
  ];
  
  for (const key of allowedKeys) {
    if (key in updateData) {
      allowedData[key] = (updateData as any)[key];
    }
  }

  const { data: newData, error } = await supabase
    .from('storefront_config')
    .update(allowedData)
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

/**
 * Publish the current storefront configuration as a new version.
 * Takes a snapshot of the current settings and stores it in publish history.
 * @param note - Optional note describing what changed in this publish
 * @returns The publish history record
 */
export async function publishStorefrontAction(note?: string) {
  const profile = await requirePermission('storefront.edit');
  const supabase = await getSupabase();

  const { data, error } = await supabase.rpc('publish_storefront', {
    p_tenant_id: profile.tenant_id,
    p_publisher_id: profile.id,
    p_note: note ?? null
  });

  if (error) {
    throw new Error(`Publish failed: ${error.message}`);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'storefront.publish',
    entityType: 'storefront_publish_history',
    entityId: (data as Record<string, unknown>)?.id as string ?? null,
    newData: data as Record<string, unknown> ?? undefined
  });

  (revalidateTag as any)(`storefront-${profile.tenant_id}`);
  return data;
}

/**
 * Rollback storefront to a specific previously published version.
 * Restores the snapshot from the specified version and creates a new version.
 * @param version - The version number to roll back to
 * @returns The newly created publish history record (rollback version)
 */
export async function rollbackStorefrontAction(version: number) {
  const profile = await requirePermission('storefront.edit');
  const supabase = await getSupabase();

  const { data, error } = await supabase.rpc('rollback_storefront', {
    p_tenant_id: profile.tenant_id,
    p_version: version,
    p_publisher_id: profile.id
  });

  if (error) {
    throw new Error(`Rollback failed: ${error.message}`);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'storefront.rollback',
    entityType: 'storefront_publish_history',
    entityId: (data as Record<string, unknown>)?.id as string ?? null,
    newData: { rollback_to_version: version, ...(data as Record<string, unknown> ?? {}) }
  });

  (revalidateTag as any)(`storefront-${profile.tenant_id}`);
  return data;
}

/**
 * Fetch the publish history for the storefront (latest first).
 * @param limit - Number of records to fetch (default: 20)
 * @returns Array of publish history records
 */
export async function getPublishHistoryAction(limit = 20) {
  const profile = await requirePermission('storefront.view');
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('storefront_publish_history')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('version', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

/**
 * Update the tenant/storefront name in the database.
 * Only owners and managers can edit.
 */
export async function updateTenantNameAction(newName: string) {
  const profile = await requirePermission('storefront.edit');
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('tenants')
    .update({ name: newName })
    .eq('id', profile.tenant_id)
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
    entityId: profile.tenant_id,
    newData: { name: newName }
  });

  return data;
}

