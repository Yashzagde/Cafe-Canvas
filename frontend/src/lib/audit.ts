/**
 * @file src/lib/audit.ts
 * @description Centralized, non-blocking audit event logger.
 *   Uses the Supabase service-role admin client so it bypasses all RLS.
 *   Fire-and-forget by default — audit failures NEVER block primary operations.
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// ── Action catalogue (extend as new mutations are added) ──────────
export type AuditAction =
  // Menu
  | 'menu_item.create' | 'menu_item.update' | 'menu_item.delete'
  | 'menu_item.availability_toggle'
  | 'category.create' | 'category.update' | 'category.delete'
  | 'modifier_group.create' | 'modifier_group.update' | 'modifier_group.delete'
  | 'modifier_option.create' | 'modifier_option.update' | 'modifier_option.delete'
  // Orders
  | 'order.create' | 'order.update' | 'order.void' | 'order.complete'
  | 'bill.create' | 'bill.void' | 'bill.discount_applied'
  // Staff
  | 'staff.create' | 'staff.update' | 'staff.deactivate'
  | 'shift.open' | 'shift.close' | 'shift.reconcile'
  | 'attendance.clock_in' | 'attendance.clock_out' | 'attendance.manual_edit'
  | 'leave.apply' | 'leave.approve' | 'leave.reject' | 'leave.cancel'
  // Tables
  | 'table.create' | 'table.update' | 'table.delete'
  | 'table.qr_regenerate' | 'table.floor_rearrange'
  // Storefront
  | 'storefront.update' | 'storefront.theme_change'
  // Auth
  | 'auth.login' | 'auth.logout' | 'auth.password_change'
  // Inventory
  | 'inventory.create' | 'inventory.adjust' | 'inventory.delete'

export type AuditEntityType =
  | 'menu_item' | 'category' | 'modifier_group' | 'modifier_option'
  | 'order' | 'bill' | 'order_item'
  | 'staff' | 'shift' | 'attendance' | 'leave'
  | 'table' | 'storefront' | 'inventory'
  | 'auth'

export interface AuditEventParams {
  tenantId:   string
  branchId?:  string
  actorId:    string
  actorRole:  'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff' | 'system'
  action:     AuditAction
  entityType: AuditEntityType
  entityId?:  string
  oldData?:   Record<string, unknown>
  newData?:   Record<string, unknown>
  metadata?:  Record<string, unknown>
  ipAddress?: string
  user_agent?: string
}

/** Service-role admin client — server-side only, never import in client components */
let _adminClient: ReturnType<typeof createClient<Database>> | null = null;

function getAdminClient() {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.warn('[audit] Supabase url or service role key is missing. Audit log skipped.');
      return null;
    }
    _adminClient = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return _adminClient;
}

/**
 * Insert an audit event into audit_logs.
 * @param params   - Event details
 * @param sync     - Await the insert (use TRUE for legally critical ops like bill void).
 *                   Default FALSE (fire-and-forget).
 */
export async function logAuditEvent(
  params: AuditEventParams,
  sync = false
): Promise<void> {
  const adminClient = getAdminClient();
  if (!adminClient) return;

  const insertPromise = adminClient
    .from('audit_logs')
    .insert({
      tenant_id:   params.tenantId,
      branch_id:   params.branchId   ?? null,
      actor_id:    params.actorId,
      actor_role:  params.actorRole,
      action:      params.action,
      entity_type: params.entityType,
      entity_id:   params.entityId   ?? null,
      old_data:    params.oldData    ?? null,
      new_data:    params.newData    ?? null,
      metadata:    params.metadata   ?? {},
      ip_address:  params.ipAddress  ?? null,
      user_agent:  params.user_agent  ?? null,
    })
    .then(({ error }) => {
      if (error) {
        // Never throw — only log to server console
        console.error('[audit] insert failed', { error, action: params.action })
      }
    })

  if (sync) await insertPromise
}
