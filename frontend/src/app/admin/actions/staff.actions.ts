'use server';

import { requirePermission } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';

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
    .from('profiles')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
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
