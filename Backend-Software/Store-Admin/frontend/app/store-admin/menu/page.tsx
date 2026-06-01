'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSyncContext } from '@/app/context/SyncContext';
import type { MenuItem, MenuCategory } from '@/app/types';
import { enqueueOperation, getPendingSyncItemIds } from '@/app/utils/offline-sync';

/* ─── Demo Data ─── */

const DEMO_CATEGORIES: MenuCategory[] = [
  { id: 'd001', tenant_id: 'demo', name: 'Hot Coffee', icon: '☕', sort_order: 0, visible: true },
  { id: 'd002', tenant_id: 'demo', name: 'Cold Brews', icon: '🧊', sort_order: 1, visible: true },
  { id: 'd003', tenant_id: 'demo', name: 'Organic Teas', icon: '🍵', sort_order: 2, visible: true },
  { id: 'd004', tenant_id: 'demo', name: 'Bakery & Sweets', icon: '🥐', sort_order: 3, visible: true },
  { id: 'd005', tenant_id: 'demo', name: 'Gourmet Bites', icon: '🍽️', sort_order: 4, visible: true },
  { id: 'd006', tenant_id: 'demo', name: 'Fresh Coolers', icon: '🍹', sort_order: 5, visible: true },
];

const DEMO_ITEMS: MenuItem[] = [
  { id: 'e001', tenant_id: 'demo', category_id: 'd001', name: 'Classic Cappuccino', description: 'Double espresso with silky steamed milk and delicate foam art.', price: 290, image_url: null, available: true, featured: true, tags: ['bestseller','hot'], prep_time_min: 5, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e002', tenant_id: 'demo', category_id: 'd001', name: 'Flat White', description: 'Velvety micro-foam espresso with full-cream milk.', price: 310, image_url: null, available: true, featured: false, tags: ['hot'], prep_time_min: 5, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e003', tenant_id: 'demo', category_id: 'd001', name: 'Caramel Macchiato', description: 'Espresso layered with vanilla syrup, steamed milk, and caramel drizzle.', price: 350, image_url: null, available: true, featured: false, tags: ['hot','sweet'], prep_time_min: 6, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'e004', tenant_id: 'demo', category_id: 'd002', name: 'Specialty Cold Brew', description: '24-hour slow-dripped single-origin cold brew.', price: 350, image_url: null, available: true, featured: true, tags: ['bestseller','cold'], prep_time_min: 1, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e005', tenant_id: 'demo', category_id: 'd002', name: 'Iced Mocha Shake', description: 'Rich chocolate blended with espresso shots over crushed ice.', price: 380, image_url: null, available: true, featured: false, tags: ['cold','sweet'], prep_time_min: 4, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e006', tenant_id: 'demo', category_id: 'd003', name: 'Green Tea Mint Infusion', description: 'Premium loose-leaf green tea with fresh mint leaves.', price: 210, image_url: null, available: true, featured: false, tags: ['veg','healthy'], prep_time_min: 4, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e007', tenant_id: 'demo', category_id: 'd003', name: 'Chamomile Honey Soothe', description: 'Warm chamomile infusion with wildflower honey.', price: 230, image_url: null, available: true, featured: false, tags: ['veg','healthy'], prep_time_min: 4, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e008', tenant_id: 'demo', category_id: 'd004', name: 'Almond Butter Croissant', description: 'Buttery flaky pastry filled with house-roasted almond cream.', price: 240, image_url: null, available: true, featured: true, tags: ['bestseller','bakery'], prep_time_min: 2, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e009', tenant_id: 'demo', category_id: 'd004', name: 'Chocolate Truffle Pastry', description: 'Belgian dark chocolate ganache in a buttery shell.', price: 180, image_url: null, available: true, featured: false, tags: ['sweet','bakery'], prep_time_min: 2, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e010', tenant_id: 'demo', category_id: 'd004', name: 'Vegan Blueberry Muffin', description: 'Oat-flour muffin packed with organic blueberries.', price: 160, image_url: null, available: false, featured: false, tags: ['veg','healthy'], prep_time_min: 2, sort_order: 2, created_at: '', updated_at: '' },
  { id: 'e011', tenant_id: 'demo', category_id: 'd005', name: 'Avocado Sourdough Toast', description: 'Mashed organic avocado on house-baked sourdough with chili flakes.', price: 390, image_url: null, available: true, featured: true, tags: ['bestseller','veg'], prep_time_min: 8, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e012', tenant_id: 'demo', category_id: 'd005', name: 'Aether Loaded Burrito', description: 'Grilled chicken, black beans, guac, salsa in a toasted wrap.', price: 420, image_url: null, available: true, featured: false, tags: ['spicy'], prep_time_min: 12, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'e013', tenant_id: 'demo', category_id: 'd006', name: 'Hibiscus Rose Cooler', description: 'Chilled hibiscus flower tea with rose syrup and lime.', price: 230, image_url: null, available: true, featured: false, tags: ['cold','healthy'], prep_time_min: 3, sort_order: 0, created_at: '', updated_at: '' },
  { id: 'e014', tenant_id: 'demo', category_id: 'd006', name: 'Matcha Latte Special', description: 'Ceremonial-grade matcha whisked with oat milk over ice.', price: 320, image_url: null, available: true, featured: false, tags: ['cold','healthy'], prep_time_min: 4, sort_order: 1, created_at: '', updated_at: '' },
];

/* ─── Sidebar Filters ─── */

type SideFilter = 'all' | 'unavailable' | string;

export default function MenuManagementPage() {
  const { effectivelyOnline, queueAction } = useSyncContext();

  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEMO_ITEMS);
  const [selectedFilter, setSelectedFilter] = useState<SideFilter>('all');
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [pendingSyncIds, setPendingSyncIds] = useState<Set<string>>(new Set());

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

  // Toggle availability
  const handleToggleAvailability = async (id: string) => {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;

    const newAvailable = !item.available;

    // Optimistic local update
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, available: newAvailable } : m));

    if (!effectivelyOnline) {
      await queueAction({
        operation: 'TOGGLE_AVAILABILITY',
        endpoint: `/api/store-admin/menu/items/${id}`,
        method: 'PATCH',
        payload: { available: newAvailable, id },
      });
      setPendingSyncIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  // Save edited item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setMenuItems(prev => prev.map(m => m.id === editItem.id ? editItem : m));

    if (!effectivelyOnline) {
      queueAction({
        operation: 'UPDATE_MENU_ITEM',
        endpoint: `/api/store-admin/menu/items/${editItem.id}`,
        method: 'PATCH',
        payload: editItem as unknown as Record<string, unknown>,
      });
    }
    setEditItem(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Menu Manager</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Configure categories, items, modifiers, and availability.
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <span>+</span> Add Menu Item
        </button>
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

            {DEMO_CATEGORIES.map(cat => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const hasPending = pendingSyncIds.has(item.id);
              const cat = DEMO_CATEGORIES.find(c => c.id === item.category_id);

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
        </div>
      </div>

      {/* Edit Drawer */}
      {editItem && (
        <div className="fixed inset-0 z-30 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md flex flex-col h-full overflow-y-auto p-6" style={{ background: 'var(--canvas-surface)', borderLeft: '1px solid var(--canvas-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>Edit Menu Item</h3>
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Modify details, pricing, and availability</span>
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
                <button type="submit" className="btn-primary flex-1">Save Changes</button>
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
