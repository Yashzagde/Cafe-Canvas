/**
 * @file src/lib/rbac.ts
 * @description Role-Based Access Control — permission matrix + guards.
 */
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type StaffRole = 'owner' | 'manager' | 'cashier' | 'kitchen' | 'waiter' | 'staff'

export type Permission =
  // Dashboard
  | 'dashboard.view'
  // Audit
  | 'audit.view'
  // Storefront
  | 'storefront.view' | 'storefront.edit'
  // Menu
  | 'menu.view'   | 'menu.create'   | 'menu.update' | 'menu.delete'
  | 'menu.toggle_availability'
  | 'modifier.view' | 'modifier.create' | 'modifier.update' | 'modifier.delete'
  // Tables
  | 'table.view'  | 'table.create'  | 'table.update' | 'table.delete'
  | 'table.qr_generate'
  // Orders
  | 'order.view'  | 'order.create'  | 'order.update' | 'order.void'
  // Bills
  | 'bill.view'   | 'bill.create'   | 'bill.void'    | 'bill.discount'
  // Staff
  | 'staff.view'  | 'staff.create'  | 'staff.update' | 'staff.deactivate'
  | 'shift.open'  | 'shift.close'   | 'shift.view_all'
  | 'attendance.view_own' | 'attendance.view_all' | 'attendance.manual_edit'
  | 'leave.apply' | 'leave.approve' | 'leave.view_all'
  | 'performance.view_own' | 'performance.view_all'
  // Inventory
  | 'inventory.view' | 'inventory.edit'
  // Analytics
  | 'analytics.view'
  // Settings
  | 'settings.view' | 'settings.edit'
  // Billing
  | 'billing.view' | 'billing.manage'

const PERMISSIONS: Record<StaffRole, ReadonlySet<Permission>> = {
  owner: new Set<Permission>([
    'dashboard.view',
    'audit.view',
    'storefront.view', 'storefront.edit',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete', 'menu.toggle_availability',
    'modifier.view', 'modifier.create', 'modifier.update', 'modifier.delete',
    'table.view', 'table.create', 'table.update', 'table.delete', 'table.qr_generate',
    'order.view', 'order.create', 'order.update', 'order.void',
    'bill.view', 'bill.create', 'bill.void', 'bill.discount',
    'staff.view', 'staff.create', 'staff.update', 'staff.deactivate',
    'shift.open', 'shift.close', 'shift.view_all',
    'attendance.view_own', 'attendance.view_all', 'attendance.manual_edit',
    'leave.apply', 'leave.approve', 'leave.view_all',
    'performance.view_own', 'performance.view_all',
    'inventory.view', 'inventory.edit',
    'analytics.view',
    'settings.view', 'settings.edit',
    'billing.view', 'billing.manage',
  ]),

  manager: new Set<Permission>([
    'dashboard.view',
    'audit.view',
    'storefront.view', 'storefront.edit',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete', 'menu.toggle_availability',
    'modifier.view', 'modifier.create', 'modifier.update', 'modifier.delete',
    'table.view', 'table.create', 'table.update', 'table.delete', 'table.qr_generate',
    'order.view', 'order.create', 'order.update', 'order.void',
    'bill.view', 'bill.create', 'bill.void', 'bill.discount',
    'staff.view', 'staff.create', 'staff.update',
    'shift.open', 'shift.close', 'shift.view_all',
    'attendance.view_own', 'attendance.view_all', 'attendance.manual_edit',
    'leave.apply', 'leave.approve', 'leave.view_all',
    'performance.view_own', 'performance.view_all',
    'inventory.view', 'inventory.edit',
    'analytics.view',
    'settings.view', 'settings.edit',
  ]),

  cashier: new Set<Permission>([
    'dashboard.view',
    'menu.view', 'menu.toggle_availability',
    'modifier.view',
    'table.view',
    'order.view', 'order.create', 'order.update',
    'bill.view', 'bill.create',
    'shift.open', 'shift.close',
    'attendance.view_own',
    'leave.apply',
    'performance.view_own',
  ]),

  kitchen: new Set<Permission>([
    'menu.view',
    'order.view', 'order.update',
    'attendance.view_own',
    'leave.apply',
  ]),

  waiter: new Set<Permission>([
    'menu.view',
    'table.view',
    'order.view', 'order.create', 'order.update',
    'bill.view', 'bill.create',
    'attendance.view_own',
    'leave.apply',
  ]),

  staff: new Set<Permission>([
    'order.view',
    'attendance.view_own',
    'leave.apply',
    'performance.view_own',
  ]),
}

/**
 * Check if a role has a given permission.
 * @param role       - Staff role from profiles table
 * @param permission - Permission key to check
 * @returns TRUE if the role may perform the action
 */
export function canAccess(role: StaffRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.has(permission) ?? false
}

/**
 * Server Action guard — throws redirect to /admin/login if unauthorized.
 * @param permission - Required permission
 * @returns Profile row of the authenticated user
 */
export async function requirePermission(permission: Permission) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/admin/login')

  const { data: userRow } = await supabase
    .from('users')
    .select('id, tenant_id, branch_id, role, name, active')
    .eq('id', user.id)
    .single()

  if (!userRow || !userRow.active)  redirect('/admin/login')
  if (!canAccess(userRow.role as StaffRole, permission)) {
    throw new Error(`Forbidden: role "${userRow.role}" lacks "${permission}"`)
  }

  const profile = {
    id: userRow.id,
    tenant_id: userRow.tenant_id,
    branch_id: userRow.branch_id,
    role: userRow.role,
    full_name: userRow.name,
    is_active: userRow.active
  };

  return profile;
}
