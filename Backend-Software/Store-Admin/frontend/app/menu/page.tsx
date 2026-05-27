'use client';

import React, { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: 'available' | 'unavailable' | 'hidden';
  description: string;
}

export default function MenuManagementPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Classic Cappuccino', price: 290, category: 'coffee', status: 'available', description: 'Double espresso with silky steamed milk.' },
    { id: '2', name: 'Specialty Cold Brew', price: 350, category: 'coffee', status: 'available', description: '24-hour slow dripped single origin cold brew.' },
    { id: '3', name: 'Green Tea Mint Infusion', price: 210, category: 'tea', status: 'available', description: 'Premium loose leaf green tea with fresh mint.' },
    { id: '4', name: 'Almond Butter Croissant', price: 240, category: 'bakery', status: 'available', description: 'Buttery flaky pastry filled with house almond cream.' },
    { id: '5', name: 'Avocado Sourdough Toast', price: 390, category: 'snacks', status: 'available', description: 'Mashed organic avocados on toasted sourdough.' },
  ]);

  const handleToggleStatus = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === 'available' ? 'unavailable' : 'available';
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      setMenuItems(prev => prev.map(item => item.id === editItem.id ? editItem : item));
      setEditItem(null);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-8 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">Menu Management</h2>
          <p className="text-sm text-neutral-400 mt-1">Configure categories, items, and customize modifiers.</p>
        </div>
        <button className="px-5 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-accent-indigo/20 flex items-center gap-2">
          <span>+ Add Menu Item</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Categories list */}
        <div className="glass-card p-6 h-fit">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Categories</span>
            <button className="text-[10px] text-accent-indigo font-bold hover:underline">+ Add</button>
          </div>

          <div className="space-y-1.5">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'coffee', label: 'Coffee Brews' },
              { id: 'tea', label: 'Organic Teas' },
              { id: 'bakery', label: 'Bakery & Sweets' },
              { id: 'snacks', label: 'Gourmet Snacks' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition ${selectedCategory === cat.id ? 'bg-accent-indigo text-white shadow' : 'bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Menu items filtered */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="glass-card overflow-hidden flex flex-col justify-between">
                
                {/* Visual Mock Card Header */}
                <div className="h-32 bg-gradient-to-br from-accent-indigo/10 to-neutral-800 p-4 relative flex items-end">
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${item.status === 'available' ? 'bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20' : 'bg-accent-rose/10 text-accent-rose border border-accent-rose/20'}`}>
                      {item.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-accent-indigo font-bold block">{item.category}</span>
                    <span className="font-display font-bold text-sm text-white block mt-1">{item.name}</span>
                  </div>
                </div>

                {/* Card Content & Toggles */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-display font-extrabold text-sm text-white">₹{item.price}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleStatus(item.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] font-semibold text-neutral-300 transition"
                      >
                        Toggle Avail
                      </button>
                      <button 
                        onClick={() => setEditItem(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo text-[10px] font-semibold transition"
                      >
                        Edit Item
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Slide-Over Panel for Edit Item */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border backdrop-blur-md p-8 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Edit Menu Item</h3>
                <span className="text-xs text-neutral-400">Configure catalog options</span>
              </div>
              <button 
                onClick={() => setEditItem(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Item Name</label>
                <input 
                  type="text" 
                  value={editItem.name} 
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 text-xs" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Price (INR)</label>
                  <input 
                    type="number" 
                    value={editItem.price} 
                    onChange={(e) => setEditItem({ ...editItem, price: Number(e.target.value) })}
                    className="w-full glass-input px-4 py-2.5 text-xs" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Status</label>
                  <select 
                    value={editItem.status} 
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value as any })}
                    className="w-full glass-input px-4 py-2.5 text-xs"
                  >
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-2">Description</label>
                <textarea 
                  rows={3}
                  value={editItem.description} 
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  className="w-full glass-input px-4 py-2.5 text-xs"
                />
              </div>

              {/* Mock Modifiers Group Inline Editor */}
              <div className="border-t border-border pt-6">
                <span className="text-xs font-bold text-white block mb-4">Modifier Groups</span>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[10px] text-neutral-400">
                  Allows extra options (e.g. Soy Milk, Decaf Coffee shots). Fully customizable.
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-accent-indigo/20"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditItem(null)}
                  className="px-4 py-3 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
