'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSyncContext } from '@/app/context/SyncContext';
import { supabase } from '@/app/utils/supabase';
import type { MenuItem, MenuCategory } from '@/app/types';
import { enqueueOperation, getPendingSyncItemIds } from '@/app/utils/offline-sync';

// ─── Tenant Context ─────────────────────────────────
const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';
const BRANCH_ID = 'ab000000-0000-0000-0000-000000000001';

// ─── Data Fetching ──────────────────────────────────

async function fetchCategories(): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('id, tenant_id, name, icon, sort_order, is_visible')
    .eq('tenant_id', TENANT_ID)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Menu] Error fetching categories:', error);
    return [];
  }

  return (data ?? []).map(c => ({
    id: c.id,
    tenant_id: c.tenant_id,
    name: c.name,
    icon: c.icon,
    sort_order: c.sort_order,
    visible: c.is_visible,
  }));
}

async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, tenant_id, category_id, name, description, price, image_url, status, featured, tags, prep_time_min, sort_order, created_at, updated_at')
    .eq('tenant_id', TENANT_ID)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[Menu] Error fetching items:', error);
    return [];
  }

  return (data ?? []).map(item => ({
    id: item.id,
    tenant_id: item.tenant_id,
    category_id: item.category_id,
    name: item.name,
    description: item.description,
    price: Math.round(item.price / 100), // paise → rupees
    image_url: item.image_url,
    available: item.status === 'available',
    featured: item.featured || false,
    tags: item.tags || [],
    prep_time_min: item.prep_time_min || 10,
    sort_order: item.sort_order || 0,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
}

/* ─── Sidebar Filters ─── */

type SideFilter = 'all' | 'unavailable' | string;

export default function MenuManagementPage() {
  const { effectivelyOnline, queueAction } = useSyncContext();

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<SideFilter>('all');
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [pendingSyncIds, setPendingSyncIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Load data from Supabase ──────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        fetchCategories(),
        fetchMenuItems(),
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (err) {
      console.error('[Menu] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Real-time subscription ──────────────────────

  useEffect(() => {
    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items', filter: `tenant_id=eq.${TENANT_ID}` },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_categories', filter: `tenant_id=eq.${TENANT_ID}` },
        () => loadData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  // Check pending sync status
  useEffect(() => {
    const checkPending = async () => {
      const ids = await getPendingSyncItemIds('TOGGLE_AVAILABILITY');
      setPendingSyncIds(ids);
    };
    checkPending();
    const interval = setInterval(checkPending, 3000);
    return () => clearInterval(interval);
  }, []);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of menuItems) {
      if (item.category_id) {
        counts[item.category_id] = (counts[item.category_id] || 0) + 1;
      }
    }
    return counts;
  }, [menuItems]);

  const unavailableCount = menuItems.filter(m => !m.available).length;

  // Filtered items
  const filteredItems = useMemo(() => {
    if (selectedFilter === 'all') return menuItems;
    if (selectedFilter === 'unavailable') return menuItems.filter(m => !m.available);
    return menuItems.filter(m => m.category_id === selectedFilter);
  }, [menuItems, selectedFilter]);

  // Toggle availability — writes directly to Supabase
  const handleToggleAvailability = async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;

    const newStatus = item.available ? 'unavailable' : 'available';

    // Optimistic local update
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));

    if (effectivelyOnline) {
      const { error } = await supabase
        .from('menu_items')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('[Menu] Toggle availability error:', error);
        // Revert optimistic update
        setMenuItems(prev => prev.map(m => m.id === id ? { ...m, available: item.available } : m));
      }
    } else {
      await queueAction({
        operation: 'TOGGLE_AVAILABILITY',
        endpoint: `/api/store-admin/menu/items/${id}/toggle`,
        method: 'PATCH',
        payload: { status: newStatus, id },
      });
      setPendingSyncIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  // Save edited item — writes to Supabase
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    setSaving(true);

    // Optimistic update
    setMenuItems(prev => prev.map(m => m.id === editItem.id ? editItem : m));

    if (effectivelyOnline) {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: editItem.name,
          description: editItem.description,
          price: editItem.price * 100, // rupees → paise for storage
          status: editItem.available ? 'available' : 'unavailable',
          featured: editItem.featured,
          prep_time_min: editItem.prep_time_min,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editItem.id);

      if (error) {
        console.error('[Menu] Save item error:', error);
        // Reload to revert
        await loadData();
      }
    } else {
      queueAction({
        operation: 'UPDATE_MENU_ITEM',
        endpoint: `/api/store-admin/menu/items/${editItem.id}`,
        method: 'PATCH',
        payload: editItem as unknown as Record<string, unknown>,
      });
    }

    setSaving(false);
    setEditItem(null);
  };

  // ─── Loading State ────────────────────────────────

  if (loading && menuItems.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Menu Manager</h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Loading menu from Supabase...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="glass-card p-4 h-fit animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 rounded-xl mb-2" style={{ background: 'var(--canvas-muted)' }} />
            ))}
          </div>
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card h-56 animate-pulse">
                <div className="h-28" style={{ background: 'var(--canvas-muted)' }} />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-3/4 rounded" style={{ background: 'var(--canvas-muted)' }} />
                  <div className="h-2 w-full rounded" style={{ background: 'var(--canvas-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Menu Manager</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {menuItems.length} items across {categories.length} categories • Connected to Supabase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="btn-ghost text-[10px] flex items-center gap-1.5">
            ↻ Refresh
          </button>
          <button className="btn-primary flex items-center gap-2">
            <span>+</span> Add Menu Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Category Sidebar */}
        <div className="glass-card p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Categories</span>
            <button className="text-[10px] font-bold" style={{ color: 'var(--accent-sapphire)' }}>+ Add</button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between"
              style={{
                background: selectedFilter === 'all' ? 'var(--accent-sapphire)' : 'transparent',
                color: selectedFilter === 'all' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              All Items
              <span className="text-[10px] font-mono">{menuItems.length}</span>
            </button>

            <button
              onClick={() => setSelectedFilter('unavailable')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between"
              style={{
                background: selectedFilter === 'unavailable' ? 'var(--accent-crimson)' : 'transparent',
                color: selectedFilter === 'unavailable' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Unavailable
              <span className="text-[10px] font-mono">{unavailableCount}</span>
            </button>

            <div className="h-px my-2" style={{ background: 'var(--canvas-border)' }} />

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-between"
                style={{
                  background: selectedFilter === cat.id ? 'var(--accent-sapphire)' : 'transparent',
                  color: selectedFilter === cat.id ? '#fff' : 'var(--text-secondary)',
                }}
              >
                <span>{cat.icon} {cat.name}</span>
                <span className="text-[10px] font-mono">{categoryCounts[cat.id] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Item Grid */}
        <div className="lg:col-span-4">
          {filteredItems.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="text-4xl mb-3">🍽️</div>
              <h3 className="font-heading font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                No items found
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {selectedFilter === 'all'
                  ? 'Add your first menu item to get started.'
                  : 'No items match this filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const hasPending = pendingSyncIds.has(item.id);
                const cat = categories.find(c => c.id === item.category_id);

                return (
                  <div key={item.id} className="glass-card overflow-hidden relative">
                    {/* Sync Pending Badge */}
                    {hasPending && (
                      <div className="sync-pending-badge">
                        <ClockIcon size={10} /> Sync Pending
                      </div>
                    )}

                    {/* Card Header */}
                    <div className="h-28 p-4 relative flex items-end" style={{
                      background: `linear-gradient(135deg, rgba(77,124,254,0.08), ${item.available ? 'var(--canvas-surface)' : 'rgba(233,69,96,0.05)'})`,
                    }}>
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="status-badge" style={{
                          background: item.available ? 'rgba(0,214,143,0.1)' : 'rgba(233,69,96,0.1)',
                          color: item.available ? 'var(--accent-emerald)' : 'var(--accent-crimson)',
                          border: `1px solid ${item.available ? 'rgba(0,214,143,0.2)' : 'rgba(233,69,96,0.2)'}`,
                          fontSize: '8px',
                        }}>
                          {item.available ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold block" style={{ color: 'var(--accent-sapphire)' }}>
                          {cat?.name || ''}
                        </span>
                        <span className="font-heading font-bold text-sm block mt-0.5" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {item.tags.map(tag => (
                            <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase" style={{
                              background: 'rgba(255,255,255,0.04)',
                              color: tag === 'bestseller' ? 'var(--accent-amber)' :
                                     tag === 'spicy' ? 'var(--accent-crimson)' :
                                     tag === 'veg' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                            }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-heading font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>
                          ₹{item.price}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid var(--canvas-border)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {item.available ? 'Mark Off' : 'Mark On'}
                          </button>
                          <button
                            onClick={() => setEditItem(item)}
                            className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                            style={{
                              background: 'rgba(77,124,254,0.08)',
                              border: '1px solid rgba(77,124,254,0.15)',
                              color: 'var(--accent-sapphire)',
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Drawer */}
      {editItem && (
        <div className="fixed inset-0 z-30 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md flex flex-col h-full overflow-y-auto p-6" style={{ background: 'var(--canvas-surface)', borderLeft: '1px solid var(--canvas-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>Edit Menu Item</h3>
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Changes saved directly to Supabase</span>
              </div>
              <button onClick={() => setEditItem(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
              }}>✕</button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-5 flex-1">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Item Name</label>
                <input type="text" value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })} className="glass-input w-full px-3 py-2.5 text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Price (₹)</label>
                  <input type="number" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: Number(e.target.value) })} className="glass-input w-full px-3 py-2.5 text-xs font-mono" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Prep Time (min)</label>
                  <input type="number" value={editItem.prep_time_min} onChange={e => setEditItem({ ...editItem, prep_time_min: Number(e.target.value) })} className="glass-input w-full px-3 py-2.5 text-xs font-mono" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea rows={3} value={editItem.description || ''} onChange={e => setEditItem({ ...editItem, description: e.target.value })} className="glass-input w-full px-3 py-2.5 text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Availability</label>
                  <select value={editItem.available ? 'true' : 'false'} onChange={e => setEditItem({ ...editItem, available: e.target.value === 'true' })} className="glass-input w-full px-3 py-2.5 text-xs">
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Featured</label>
                  <select value={editItem.featured ? 'true' : 'false'} onChange={e => setEditItem({ ...editItem, featured: e.target.value === 'true' })} className="glass-input w-full px-3 py-2.5 text-xs">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>

              {/* Modifiers Section */}
              <div className="border-t pt-4" style={{ borderColor: 'var(--canvas-border)' }}>
                <span className="text-xs font-bold block mb-2" style={{ color: 'var(--text-primary)' }}>Modifier Groups</span>
                <div className="p-3 rounded-xl text-[11px]" style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)' }}>
                  Allows extra options (e.g. Size: Regular / Large, Milk: Full Cream / Oat Milk). Configure after saving.
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditItem(null)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClockIcon({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
