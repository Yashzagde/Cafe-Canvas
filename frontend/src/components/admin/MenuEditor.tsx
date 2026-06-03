'use client';

import { useState, useEffect } from 'react';
import { getModifierGroupsAction, createModifierGroupAction, createModifierOptionAction } from '@/app/admin/actions/menu.actions';
import { useToast } from '@/components/admin/UIPrimitives';
import { Plus, Coffee, Sparkles, Layers, ListPlus } from 'lucide-react';

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
}

export default function MenuEditor() {
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectionType, setSelectionType] = useState<'required_single' | 'optional_single' | 'multi_select'>('optional_single');

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

  useEffect(() => {
    loadGroups();
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
      });
      if (newGroup) {
        setGroups([...groups, { ...newGroup, modifier_options: [] } as ModifierGroup]);
        setShowAddGroup(false);
        setGroupName('');
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
                    {g.selection_type.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddOption(g.id)}
                  className="p-1.5 bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#d97706]/50 text-[#1e293b]/60 hover:text-[#d97706] rounded-xl cursor-pointer"
                  title="Add Option"
                >
                  <ListPlus size={14} />
                </button>
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {g.modifier_options.length === 0 ? (
                  <span className="text-[10px] text-[#1e293b]/30 uppercase block font-semibold">No options added.</span>
                ) : (
                  g.modifier_options.map((opt) => (
                    <div key={opt.id} className="flex justify-between items-center text-xs py-2 px-3 bg-[#f1f5f9]/40 rounded-xl">
                      <span className="font-bold text-[#1e293b]/80">{opt.name}</span>
                      <span className="font-mono text-[#d97706] font-bold">
                        {opt.price_delta_paise === 0 ? 'Free' : `+₹${(opt.price_delta_paise / 100).toFixed(2)}`}
                      </span>
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

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={() => setShowAddGroup(false)}
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
