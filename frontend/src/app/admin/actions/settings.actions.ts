'use server';

import { requirePermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );
}

export async function getSettingsAction() {
  const profile = await requirePermission('settings.view');
  const supabase = await getSupabase();

  // 1. Fetch tenant details
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', profile.tenant_id)
    .single();

  if (tenantError) {
    throw new Error(`Failed to load tenant: ${tenantError.message}`);
  }

  // 2. Fetch or create store settings
  let { data: settings, error: settingsError } = await supabase
    .from('store_settings')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle();

  if (settingsError) {
    throw new Error(`Failed to load store settings: ${settingsError.message}`);
  }

  // If settings don't exist, create a default row
  if (!settings) {
    const { data: newSettings, error: insertError } = await supabase
      .from('store_settings')
      .insert({
        tenant_id: profile.tenant_id,
        currency: 'INR',
        tax_cgst: 250,
        tax_sgst: 250,
        tax_inclusive: false,
        open_time: '09:00',
        close_time: '22:00'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to auto-create store settings:', insertError);
    } else {
      settings = newSettings;
    }
  }

  return { tenant, settings };
}

export async function updateGeneralSettingsAction(updateData: {
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}) {
  const profile = await requirePermission('settings.edit');
  const supabase = await getSupabase();

  // Fetch old data for audit log
  const { data: oldData } = await supabase
    .from('tenants')
    .select('name, phone, address, city, state, pincode')
    .eq('id', profile.tenant_id)
    .single();

  const { data: newData, error } = await supabase
    .from('tenants')
    .update({
      name: updateData.name,
      phone: updateData.phone ?? null,
      address: updateData.address ?? null,
      city: updateData.city ?? null,
      state: updateData.state ?? null,
      pincode: updateData.pincode ?? null,
    })
    .eq('id', profile.tenant_id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Log audit event
  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'settings.update',
    entityType: 'settings',
    entityId: profile.tenant_id,
    oldData: oldData ? (oldData as Record<string, unknown>) : undefined,
    newData: newData ? (newData as Record<string, unknown>) : undefined
  });

  return newData;
}

export async function updateStoreSettingsAction(updateData: {
  tax_cgst: number; // percentage, e.g. 9
  tax_sgst: number; // percentage, e.g. 9
  tax_inclusive: boolean;
  razorpay_key_id?: string | null;
  upi_id?: string | null;
  open_time?: string | null;
  close_time?: string | null;
  receipt_header?: string | null;
  receipt_footer?: string | null;
}) {
  const profile = await requirePermission('settings.edit');
  const supabase = await getSupabase();

  // Fetch old data for audit log
  const { data: oldData } = await supabase
    .from('store_settings')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .maybeSingle();

  // Convert percentage rates to basis points
  const cgstBasisPoints = Math.round(updateData.tax_cgst * 100);
  const sgstBasisPoints = Math.round(updateData.tax_sgst * 100);

  const { data: newData, error } = await supabase
    .from('store_settings')
    .upsert({
      tenant_id: profile.tenant_id,
      tax_cgst: cgstBasisPoints,
      tax_sgst: sgstBasisPoints,
      tax_inclusive: updateData.tax_inclusive,
      razorpay_key_id: updateData.razorpay_key_id ?? null,
      upi_id: updateData.upi_id ?? null,
      open_time: updateData.open_time ?? null,
      close_time: updateData.close_time ?? null,
      receipt_header: updateData.receipt_header ?? null,
      receipt_footer: updateData.receipt_footer ?? null,
    }, { onConflict: 'tenant_id' })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Log audit event
  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: profile.branch_id || undefined,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'settings.update',
    entityType: 'settings',
    entityId: newData.id,
    oldData: oldData ? (oldData as Record<string, unknown>) : undefined,
    newData: newData ? (newData as Record<string, unknown>) : undefined
  });

  return newData;
}
