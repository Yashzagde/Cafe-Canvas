'use server';

import { requirePermission } from '@/lib/rbac';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/utils/supabase/env';
import type { Database } from '@/types/database';

/** Create an authenticated Supabase server client */
async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey() || 'placeholder',
    { cookies: { get(n) { return cookieStore.get(n)?.value } } }
  );
}

export interface ActivityFeedItem {
  id: string;
  activity_type: string;
  entity_type: string | null;
  entity_id: string | null;
  display_text: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  staff_name?: string;
  branch_name?: string;
}

/**
 * Fetch the recent activity feed for the tenant.
 * Joins staff profile names for display.
 * @param limit - Number of records (default 50)
 * @param cursor - ISO timestamp cursor for pagination (fetch older than this)
 */
export async function getActivityFeedAction(
  limit = 50,
  cursor?: string
): Promise<ActivityFeedItem[]> {
  const profile = await requirePermission('dashboard.view');
  const supabase = await getSupabase();

  let query = supabase
    .from('staff_activity_feed')
    .select('*')
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Resolve staff names in bulk
  const staffIds = [...new Set((data ?? []).map(d => d.staff_id).filter(Boolean))];
  let staffMap: Record<string, string> = {};

  if (staffIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', staffIds as string[]);

    staffMap = (profiles ?? []).reduce((acc, p) => {
      acc[p.id] = p.full_name || 'Unknown Staff';
      return acc;
    }, {} as Record<string, string>);
  }

  // Resolve branch names
  const branchIds = [...new Set((data ?? []).map(d => d.branch_id).filter(Boolean))];
  let branchMap: Record<string, string> = {};

  if (branchIds.length > 0) {
    const { data: branches } = await supabase
      .from('branches')
      .select('id, name')
      .in('id', branchIds as string[]);

    branchMap = (branches ?? []).reduce((acc, b) => {
      acc[b.id] = b.name;
      return acc;
    }, {} as Record<string, string>);
  }

  return (data ?? []).map(item => ({
    id: item.id,
    activity_type: item.activity_type,
    entity_type: item.entity_type,
    entity_id: item.entity_id,
    display_text: item.display_text,
    metadata: item.metadata as Record<string, unknown>,
    created_at: item.created_at,
    staff_name: item.staff_id ? staffMap[item.staff_id] ?? 'System' : 'System',
    branch_name: item.branch_id ? branchMap[item.branch_id] : undefined
  }));
}

/**
 * Post a manual activity entry (e.g., admin notes, announcements).
 */
export async function postActivityAction(
  activityType: string,
  displayText: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  const profile = await requirePermission('dashboard.view');
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from('staff_activity_feed')
    .insert({
      tenant_id: profile.tenant_id,
      branch_id: profile.branch_id ?? null,
      staff_id: profile.id,
      activity_type: activityType,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      display_text: displayText,
      metadata: metadata ?? {}
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
