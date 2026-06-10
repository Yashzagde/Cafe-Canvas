'use client';

import { useState, useEffect, useMemo } from 'react';
import { getModifierGroupsAction, createModifierGroupAction, createModifierOptionAction, getMenuItemsForModifiersAction, deleteModifierGroupAction, deleteModifierOptionAction } from '@/app/admin/actions/menu.actions';
import { useToast } from '@/components/admin/UIPrimitives';
import { Plus, Coffee, Sparkles, Layers, ListPlus, Trash2, Search, X } from 'lucide-react';

interface ModifierOption {
  id: string;
  name: string;
  price_delta_paise: number;
  is_available: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  selection_type: 'required_single' | 'optional_single' | 'multi_select';
  min_selections: number;
  max_selections: number;
  modifier_options: ModifierOption[];
  menu_item_modifier_groups?: { item_id: string }[];
}

export default function MenuEditor() {
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [menuItems, setMenuItems] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectionType, setSelectionType] = useState<'required_single' | 'optional_single' | 'multi_select'>('optional_single');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const filteredMenuItems = useMemo(() => {
    if (!itemSearch.trim()) return menuItems.filter(i => !selectedItemIds.includes(i.id));
    const q = itemSearch.toLowerCase();
    return menuItems.filter(i => !selectedItemIds.includes(i.id) && i.name.toLowerCase().includes(q));
  }, [menuItems, itemSearch, selectedItemIds]);

  const selectedMenuItems = useMemo(() => {
    return menuItems.filter(i => selectedItemIds.includes(i.id));
  }, [menuItems, selectedItemIds]);

  const [showAddOption, setShowAddOption] = useState<string | null>(null);
  const [optionName, setOptionName] = useState('');
  const [priceDelta, setPriceDelta] = useState(0);

  const [toastItem, toast] = useToast();

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await getModifierGroupsAction();
      setGroups(data as any);
    } catch (err) {
      console.error('Failed to load modifier groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const data = await getMenuItemsForModifiersAction();
      setMenuItems(data || []);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    }
  };

  useEffect(() => {
    loadGroups();
    loadMenuItems();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newGroup = await createModifierGroupAction({
        name: groupName,
        selection_type: selectionType,
        min_selections: selectionType === 'required_single' ? 1 : 0,
        max_selections: 1,
        sort_order: 0
      }, selectedItemIds);
      if (newGroup) {
        const groupLinks = selectedItemIds.map(itemId => ({ item_id: itemId }));
        setGroups([...groups, { 
          ...newGroup, 
          modifier_options: [],
          menu_item_modifier_groups: groupLinks
        } as ModifierGroup]);
        setShowAddGroup(false);
        setGroupName('');
        setSelectedItemIds([]);
        setItemSearch('');
        setShowItemDropdown(false);
        toast('Modifier group created!', 'success');
      }
    } catch (err) {
      toast('Failed to create group.', 'error');
    }
  };

  const handleCreateOption = async (e: React.FormEvent, groupId: string) => {
    e.preventDefault();
    try {
      const newOption = await createModifierOptionAction({
        group_id: groupId,
        name: optionName,
        price_delta_paise: Math.round(priceDelta * 100), // rupees to paise
        is_default: false,
        is_available: true,
        sort_order: 0
      });
      if (newOption) {
        setGroups(groups.map(g => g.id === groupId ? { ...g, modifier_options: [...g.modifier_options, newOption] } : g));
        setShowAddOption(null);
        setOptionName('');
        setPriceDelta(0);
        toast('Option added successfully!', 'success');
      }
    } catch (err) {
      toast('Failed to add option.', 'error');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this modifier group?')) return;
    try {
      await deleteModifierGroupAction(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
      toast('Modifier group deleted.', 'success');
    } catch (err) {
      toast('Failed to delete group.', 'error');
    }
  };

  const handleDeleteOption = async (optionId: string, groupId: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;
    try {
      await deleteModifierOptionAction(optionId);
      setGroups(groups.map(g => g.id === groupId ? {
        ...g,
        modifier_options: g.modifier_options.filter(o => o.id !== optionId)
      } : g));
      toast('Option deleted.', 'success');
    } catch (err) {
      toast('Failed to delete option.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-[#1e293b] animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Modifier Groups & Add-ons</h2>
          <p className="text-xs text-[#1e293b]/50">Create reusable modifiers (e.g. Milk Options, Extra Drizzle) across menu items.</p>
        </div>
        <button
          onClick={() => setShowAddGroup(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#d97706] to-[#ca8a04] hover:opacity-95 text-[#ffffff] font-extrabold rounded-2xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Group</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#1e293b]/40">
          <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-12 bg-[#ffffff] border border-[#e2e8f0] rounded-3xl text-center text-[#1e293b]/40">
          No customizable modifiers configured. Create a modifier group to start.
        </div>
      ) : (
        /* Grid of modifier groups cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div key={g.id} className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-start border-b border-[#e2e8f0]/40 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-[#1e293b]/85">{g.name}</h4>
                  <span className="text-[10px] text-[#d97706] font-bold uppercase tracking-wider">
                    {(g.selection_type || 'optional_single').replace('_', ' ')}
                  </span>
                  
                  {/* Linked Menu Items Badges */}
                  {g.menu_item_modifier_groups && g.menu_item_modifier_groups.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 max-w-xs">
                      {g.menu_item_modifier_groups.map((link) => {
                        const item = menuItems.find(i => i.id === link.item_id);
                        return item ? (
                          <span key={link.item_id} className="px-1.5 py-0.5 bg-[#f1f5f9] text-[#1e293b]/60 border border-[#e2e8f0] rounded-lg text-[9px] font-bold">
                            {item.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowAddOption(g.id)}
                    className="p-1.5 bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#d97706]/50 text-[#1e293b]/60 hover:text-[#d97706] rounded-xl cursor-pointer transition-colors"
                    title="Add Option"
                  >
                    <ListPlus size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(g.id)}
                    className="p-1.5 bg-[#f1f5f9] border border-[#e2e8f0] hover:border-red-500/50 text-[#1e293b]/60 hover:text-red-500 rounded-xl cursor-pointer transition-colors"
                    title="Delete Group"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {g.modifier_options.length === 0 ? (
                  <span className="text-[10px] text-[#1e293b]/30 uppercase block font-semibold">No options added.</span>
                ) : (
                  g.modifier_options.map((opt) => (
                    <div key={opt.id} className="flex justify-between items-center text-xs py-2 px-3 bg-[#f1f5f9]/40 rounded-xl transition-all">
                      <span className="font-bold text-[#1e293b]/80">{opt.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#d97706] font-bold">
                          {opt.price_delta_paise === 0 ? 'Free' : `+₹${(opt.price_delta_paise / 100).toFixed(2)}`}
                        </span>
                        <button
                          onClick={() => handleDeleteOption(opt.id, g.id)}
                          className="text-[#1e293b]/30 hover:text-red-500 cursor-pointer p-0.5 rounded transition-colors"
                          title="Delete Option"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add option inline modal/form */}
              {showAddOption === g.id && (
                <form onSubmit={(e) => handleCreateOption(e, g.id)} className="pt-3 border-t border-[#e2e8f0]/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Option name (e.g. Oat Milk)"
                      value={optionName}
                      onChange={(e) => setOptionName(e.target.value)}
                      className="px-3 py-2 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-xs focus:outline-none focus:border-[#d97706]"
                    />
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="Price delta (e.g. 30)"
                      value={priceDelta}
                      onChange={(e) => setPriceDelta(parseFloat(e.target.value))}
                      className="px-3 py-2 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-xs focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddOption(null)}
                      className="px-2.5 py-1 bg-transparent hover:underline text-[#1e293b]/50 text-[10px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#d97706] text-[#ffffff] text-[10px] font-extrabold rounded-lg cursor-pointer"
                    >
                      Save Option
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 animate-fade-in">
          <form onSubmit={handleCreateGroup} className="w-full max-w-md bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold font-display border-b border-[#e2e8f0]/50 pb-2">Create Modifier Group</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1e293b]/50">Group Name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Choose Milk Type"
                className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1e293b]/50">Selection Logic</label>
              <select
                value={selectionType}
                onChange={(e: any) => setSelectionType(e.target.value)}
                className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
              >
                <option value="required_single">Required Single (Customer must pick 1)</option>
                <option value="optional_single">Optional Single (Customer picks 0 or 1)</option>
                <option value="multi_select">Multi Select (Customer can pick multiple)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1e293b]/50">Link to Menu Items</label>

              {/* Selected items as removable chips */}
              {selectedMenuItems.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedMenuItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-[#d97706]/10 to-[#ca8a04]/10 border border-[#d97706]/30 text-[#92400e] rounded-full text-[11px] font-bold transition-all hover:border-[#d97706]/60"
                    >
                      <Coffee size={10} className="text-[#d97706]" />
                      {item.name}
                      <button
                        type="button"
                        onClick={() => setSelectedItemIds(selectedItemIds.filter(id => id !== item.id))}
                        className="ml-0.5 p-0.5 hover:bg-[#d97706]/20 rounded-full cursor-pointer transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e293b]/30" />
                <input
                  type="text"
                  placeholder="Type to search menu items..."
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowItemDropdown(true);
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-xs focus:outline-none focus:border-[#d97706] transition-colors"
                />
              </div>

              {/* Dropdown list of items */}
              {showItemDropdown && (
                <div className="max-h-36 overflow-y-auto border border-[#e2e8f0] rounded-xl bg-white shadow-lg space-y-0.5">
                  {filteredMenuItems.length === 0 ? (
                    <div className="py-3 px-4 text-xs text-[#1e293b]/40 text-center">
                      {menuItems.length === 0 ? 'No menu items found.' : 'No matching items.'}
                    </div>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setSelectedItemIds([...selectedItemIds, item.id]);
                          setItemSearch('');
                        }}
                        className="w-full flex items-center gap-2 text-xs font-bold text-[#1e293b]/80 cursor-pointer hover:bg-[#f1f5f9] px-3.5 py-2 text-left transition-colors"
                      >
                        <Plus size={12} className="text-[#d97706]/60" />
                        <span>{item.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddGroup(false);
                  setItemSearch('');
                  setShowItemDropdown(false);
                  setSelectedItemIds([]);
                }}
                className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#f1f5f9]/80 text-[#1e293b]/70 font-bold rounded-2xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#d97706] to-[#ca8a04] text-[#ffffff] font-extrabold rounded-2xl text-xs cursor-pointer"
              >
                Save Group
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification Container */}
      {toastItem && <div className="fixed bottom-6 right-6 p-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-2xl text-xs font-bold">{toastItem.msg}</div>}
    </div>
  );
}
