'use server';

import { requirePermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';
import { createAdminClient } from '@/utils/supabase/admin';
import { sendStaffWelcomeWhatsApp } from '@/lib/msg91';
import bcrypt from 'bcryptjs';

/**
 * Fetch all staff profiles for the current tenant.
 */
export async function getStaffListAction() {
  const profile = await requirePermission('staff.view');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const mapped = (data || []).map(u => ({
    ...u,
    full_name: u.name,
    is_active: u.active
  }));

  return mapped;
}

/**
 * Trigger staff clock-in.
 */
export async function clockInAction(staffId: string, branchId: string) {
  const profile = await requirePermission('attendance.view_own'); // minimum permission to clock in
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  // Check if already clocked in
  const { data: active } = await supabase
    .from('staff_attendance')
    .select('id')
    .eq('staff_id', staffId)
    .is('clock_out', null)
    .maybeSingle();

  if (active) {
    throw new Error('Staff is already clocked in.');
  }

  const { data, error } = await supabase
    .from('staff_attendance')
    .insert({
      tenant_id: profile.tenant_id,
      branch_id: branchId,
      staff_id: staffId,
      clock_in: new Date().toISOString(),
      source: 'pos'
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: branchId,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'attendance.clock_in',
    entityType: 'attendance',
    entityId: data.id,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Trigger staff clock-out.
 */
export async function clockOutAction(attendanceId: string) {
  const profile = await requirePermission('attendance.view_own');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data: oldData } = await supabase
    .from('staff_attendance')
    .select('*')
    .eq('id', attendanceId)
    .single();

  if (!oldData) {
    throw new Error('Attendance session not found.');
  }

  const { data, error } = await supabase
    .from('staff_attendance')
    .update({
      clock_out: new Date().toISOString()
    })
    .eq('id', attendanceId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: oldData.branch_id,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'attendance.clock_out',
    entityType: 'attendance',
    entityId: attendanceId,
    oldData: oldData as Record<string, unknown>,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Submit a leave application.
 */
export async function applyLeaveAction(leaveData: Omit<Database['public']['Tables']['staff_leaves']['Insert'], 'tenant_id' | 'staff_id' | 'status'>) {
  const profile = await requirePermission('leave.apply');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('staff_leaves')
    .insert({
      ...leaveData,
      tenant_id: profile.tenant_id,
      staff_id: profile.id,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'leave.apply',
    entityType: 'leave',
    entityId: data.id,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Approve or Reject a leave application.
 */
export async function reviewLeaveAction(leaveId: string, status: 'approved' | 'rejected', notes?: string) {
  const profile = await requirePermission('leave.approve');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data: oldData } = await supabase
    .from('staff_leaves')
    .select('*')
    .eq('id', leaveId)
    .single();

  if (!oldData) {
    throw new Error('Leave record not found.');
  }

  const { data, error } = await supabase
    .from('staff_leaves')
    .update({
      status,
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      rejection_note: status === 'rejected' ? notes || null : null
    })
    .eq('id', leaveId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    actorId: profile.id,
    actorRole: profile.role,
    action: status === 'approved' ? 'leave.approve' : 'leave.reject',
    entityType: 'leave',
    entityId: leaveId,
    oldData: oldData as Record<string, unknown>,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Open a new cashier shift (POS).
 */
export async function openShiftAction(branchId: string, openingCash: number, notes?: string) {
  const profile = await requirePermission('shift.open');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data, error } = await supabase
    .from('pos_shifts')
    .insert({
      tenant_id: profile.tenant_id,
      branch_id: branchId,
      cashier_id: profile.id,
      opening_cash_paise: openingCash,
      status: 'open',
      notes: notes || null
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'shift.open',
    entityType: 'shift',
    entityId: data.id,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Close an active cashier shift (POS).
 */
export async function closeShiftAction(shiftId: string, closingCash: number, notes?: string) {
  const profile = await requirePermission('shift.close');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  const { data: oldData } = await supabase
    .from('pos_shifts')
    .select('*')
    .eq('id', shiftId)
    .single();

  if (!oldData) {
    throw new Error('POS shift not found.');
  }

  const { data, error } = await supabase
    .from('pos_shifts')
    .update({
      closing_cash_paise: closingCash,
      closed_at: new Date().toISOString(),
      status: 'closed',
      notes: notes || oldData.notes
    })
    .eq('id', shiftId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: oldData.branch_id,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'shift.close',
    entityType: 'shift',
    entityId: shiftId,
    oldData: oldData as Record<string, unknown>,
    newData: data as Record<string, unknown>
  });

  return data;
}

/**
 * Create a new staff account with a 50-account cap constraint and WhatsApp alert.
 */
export async function createStaffAction(params: {
  name: string;
  phone: string;
  role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff';
  pin: string;
  branchId: string;
}) {
  const profile = await requirePermission('staff.create');
  
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );

  // 1. Validate staff count (limit of 50 accounts per tenant)
  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', profile.tenant_id);

  if (countError) {
    throw new Error(countError.message);
  }

  if (count !== null && count >= 50) {
    throw new Error('Tenant has reached the limit of 50 staff sub-accounts.');
  }

  // 2. Hash PIN with bcrypt
  const salt = bcrypt.genSaltSync(10);
  const pinHash = bcrypt.hashSync(params.pin, salt);

  // 3. Create Admin client for Auth creation
  const admin = createAdminClient();
  if (!admin) {
    throw new Error('Service role key is not configured.');
  }

  // 4. We construct email as phone@cafecanvas.bar
  const email = `${params.phone}@cafecanvas.bar`;

  // Create Auth user
  const password = `Cc_${params.pin}_${Math.random().toString(36).substring(2, 6)}`;
  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    phone: params.phone,
    email_confirm: true,
    phone_confirm: true,
    app_metadata: {
      tenant_id: profile.tenant_id,
      branch_id: params.branchId,
      role: params.role,
    },
  });

  if (authError || !authUser.user) {
    throw new Error(authError?.message ?? 'Failed to create auth user');
  }

  // Insert into users table
  const { error: profileError } = await admin.from('users').insert({
    id: authUser.user.id,
    tenant_id: profile.tenant_id,
    branch_id: params.branchId,
    name: params.name,
    email,
    phone: params.phone,
    role: params.role,
    pin_hash: pinHash,
    active: true,
  });

  if (profileError) {
    // Cleanup auth user
    await admin.auth.admin.deleteUser(authUser.user.id);
    throw new Error(profileError.message);
  }

  // Get tenant business name
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', profile.tenant_id)
    .single();

  const businessName = tenant?.name || 'CafeCanvas';

  // Send MSG91 welcome WhatsApp message
  sendStaffWelcomeWhatsApp({
    phone: params.phone,
    staffName: params.name,
    businessName,
    pinCode: params.pin,
  }).catch((err) => {
    console.error('Failed to dispatch welcome WhatsApp:', err);
  });

  // Log Audit Event
  await logAuditEvent({
    tenantId: profile.tenant_id,
    branchId: params.branchId,
    actorId: profile.id,
    actorRole: profile.role,
    action: 'staff.create',
    entityType: 'staff',
    entityId: authUser.user.id,
    newData: {
      id: authUser.user.id,
      name: params.name,
      phone: params.phone,
      role: params.role,
      branch_id: params.branchId,
    },
  });

  return { success: true };
}
