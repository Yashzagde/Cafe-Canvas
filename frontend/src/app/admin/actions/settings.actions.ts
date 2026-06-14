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
        close_time: '22:00',
        service_charge_type: 'none',
        service_charge_value_paise: 0
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
  logo_url?: string | null;
}) {
  const profile = await requirePermission('settings.edit');
  const supabase = await getSupabase();

  // Fetch old data for audit log
  const { data: oldData } = await supabase
    .from('tenants')
    .select('name, phone, address, city, state, pincode, logo_url')
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
      logo_url: updateData.logo_url ?? undefined,
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
  upi_id?: string | null;
  upi_name?: string | null;
  payment_methods?: string[] | null;
  min_order_amount_paise?: number | null;
  open_time?: string | null;
  close_time?: string | null;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  service_charge_type?: string | null;
  service_charge_value?: number | null; // percentage or flat (visual)
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
      upi_id: updateData.upi_id ?? null,
      upi_name: updateData.upi_name ?? null,
      payment_methods: updateData.payment_methods ?? ['cash', 'upi'],
      min_order_amount_paise: updateData.min_order_amount_paise ?? 0,
      open_time: updateData.open_time ?? null,
      close_time: updateData.close_time ?? null,
      receipt_header: updateData.receipt_header ?? null,
      receipt_footer: updateData.receipt_footer ?? null,
      service_charge_type: updateData.service_charge_type ?? 'none',
      service_charge_value_paise: updateData.service_charge_value != null
        ? Math.round(updateData.service_charge_value * 100)
        : 0,
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
