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
    <div className="space-y-6 text-[#fcfaf4] animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#262b38]/50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Modifier Groups & Add-ons</h2>
          <p className="text-xs text-[#fcfaf4]/50">Create reusable modifiers (e.g. Milk Options, Extra Drizzle) across menu items.</p>
        </div>
        <button
          onClick={() => setShowAddGroup(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#e28743] to-[#f0a050] hover:opacity-95 text-[#151820] font-extrabold rounded-2xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          <span>Create Group</span>
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#fcfaf4]/40">
          <span className="inline-block w-6 h-6 border-2 border-[#e28743] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-12 bg-[#151820] border border-[#262b38] rounded-3xl text-center text-[#fcfaf4]/40">
          No customizable modifiers configured. Create a modifier group to start.
        </div>
      ) : (
        /* Grid of modifier groups cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((g) => (
            <div key={g.id} className="bg-[#151820] border border-[#262b38] rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-start border-b border-[#262b38]/40 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-[#fcfaf4]/85">{g.name}</h4>
                  <span className="text-[10px] text-[#e28743] font-bold uppercase tracking-wider">
                    {g.selection_type.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={() => setShowAddOption(g.id)}
                  className="p-1.5 bg-[#1e222d] border border-[#262b38] hover:border-[#e28743]/50 text-[#fcfaf4]/60 hover:text-[#e28743] rounded-xl cursor-pointer"
                  title="Add Option"
                >
                  <ListPlus size={14} />
                </button>
              </div>

              {/* Options list */}
              <div className="space-y-2">
                {g.modifier_options.length === 0 ? (
                  <span className="text-[10px] text-[#fcfaf4]/30 uppercase block font-semibold">No options added.</span>
                ) : (
                  g.modifier_options.map((opt) => (
                    <div key={opt.id} className="flex justify-between items-center text-xs py-2 px-3 bg-[#1e222d]/40 rounded-xl">
                      <span className="font-bold text-[#fcfaf4]/80">{opt.name}</span>
                      <span className="font-mono text-[#e28743] font-bold">
                        {opt.price_delta_paise === 0 ? 'Free' : `+₹${(opt.price_delta_paise / 100).toFixed(2)}`}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Add option inline modal/form */}
              {showAddOption === g.id && (
                <form onSubmit={(e) => handleCreateOption(e, g.id)} className="pt-3 border-t border-[#262b38]/30 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Option name (e.g. Oat Milk)"
                      value={optionName}
                      onChange={(e) => setOptionName(e.target.value)}
                      className="px-3 py-2 bg-[#1e222d] border border-[#262b38] rounded-xl text-xs focus:outline-none focus:border-[#e28743]"
                    />
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="Price delta (e.g. 30)"
                      value={priceDelta}
                      onChange={(e) => setPriceDelta(parseFloat(e.target.value))}
                      className="px-3 py-2 bg-[#1e222d] border border-[#262b38] rounded-xl text-xs focus:outline-none focus:border-[#e28743]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddOption(null)}
                      className="px-2.5 py-1 bg-transparent hover:underline text-[#fcfaf4]/50 text-[10px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#e28743] text-[#151820] text-[10px] font-extrabold rounded-lg cursor-pointer"
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
          <form onSubmit={handleCreateGroup} className="w-full max-w-md bg-[#151820] border border-[#262b38] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold font-display border-b border-[#262b38]/50 pb-2">Create Modifier Group</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#fcfaf4]/50">Group Name</label>
              <input
                type="text"
                required
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Choose Milk Type"
                className="w-full px-4 py-3 bg-[#1e222d] border border-[#262b38] rounded-xl text-sm focus:outline-none focus:border-[#e28743]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#fcfaf4]/50">Selection Logic</label>
              <select
                value={selectionType}
                onChange={(e: any) => setSelectionType(e.target.value)}
                className="w-full px-4 py-3 bg-[#1e222d] border border-[#262b38] rounded-xl text-sm focus:outline-none focus:border-[#e28743]"
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
                className="px-4 py-2 bg-[#1e222d] hover:bg-[#1e222d]/80 text-[#fcfaf4]/70 font-bold rounded-2xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#e28743] to-[#f0a050] text-[#151820] font-extrabold rounded-2xl text-xs cursor-pointer"
              >
                Save Group
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification Container */}
      {toastItem && <div className="fixed bottom-6 right-6 p-4 bg-[#1e222d] border border-[#262b38] rounded-2xl text-xs font-bold">{toastItem.msg}</div>}
    </div>
  );
}
