'use client';

import { useState, useEffect } from 'react';
import { 
  getStaffListAction, 
  createStaffAction, 
  reviewLeaveAction,
  toggleStaffStatusAction,
  updateStaffPinAction
} from '@/app/admin/actions/staff.actions';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/admin/UIPrimitives';
import { UserCheck, Calendar, Plus, X, AlertTriangle, Eye, EyeOff, Edit3, Lock } from 'lucide-react';

interface StaffProfile {
  id: string;
  full_name: string;
  role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff';
  phone: string | null;
  is_active: boolean;
  pin_hash?: string | null;
}

interface LeaveRequest {
  id: string;
  staff_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  staff_name?: string;
}

interface StaffManagerProps {
  branchId: string;
}

export default function StaffManager({ branchId }: StaffManagerProps) {
  const supabase = createClient();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'leaves'>('roster');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [visiblePins, setVisiblePins] = useState<Record<string, boolean>>({});
  const [editingPinStaff, setEditingPinStaff] = useState<StaffProfile | null>(null);
  const [newPinCode, setNewPinCode] = useState('');
  const [updatingPin, setUpdatingPin] = useState(false);

  const togglePinVisibility = (id: string) => {
    setVisiblePins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleStatus = async (staffId: string, currentActive: boolean) => {
    if (!confirm(`Are you sure you want to ${currentActive ? 'suspend' : 'activate'} this staff member?`)) {
      return;
    }
    try {
      const res = await toggleStaffStatusAction(staffId, !currentActive);
      if (res.success) {
        toast(`Account status updated!`, 'success');
        loadData();
      }
    } catch (err: any) {
      toast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleOpenChangePinModal = (profile: StaffProfile) => {
    setEditingPinStaff(profile);
    setNewPinCode('');
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPinStaff) return;
    if (!/^\d{4}$/.test(newPinCode)) {
      toast('PIN must be exactly 4 digits.', 'error');
      return;
    }
    setUpdatingPin(true);
    try {
      const res = await updateStaffPinAction(editingPinStaff.id, newPinCode);
      if (res.success) {
        toast(`PIN updated successfully!`, 'success');
        setEditingPinStaff(null);
        setNewPinCode('');
        loadData();
      }
    } catch (err: any) {
      toast(err.message || 'Failed to update PIN.', 'error');
    } finally {
      setUpdatingPin(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'staff' as 'manager' | 'cashier' | 'kitchen' | 'staff',
    pin: '',
    branchId: branchId || '',
  });

  const [toastItem, toast] = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Staff profiles
      const staffList = (await getStaffListAction()) as any[] || [];
      setStaff(staffList as StaffProfile[]);

      // Load leaves requests
      const { data: leavesList } = await supabase
        .from('staff_leaves')
        .select('*')
        .order('created_at', { ascending: false });

      if (leavesList) {
        const mappedLeaves: LeaveRequest[] = (leavesList as any[]).map(l => ({
          ...l,
          staff_name: staffList.find((s: any) => s.id === l.staff_id)?.full_name || 'Staff Member'
        }));
        setLeaves(mappedLeaves);
      }

      // Load branches
      const { data: branchList } = await supabase
        .from('branches')
        .select('id, name')
        .eq('active', true);

      if (branchList) {
        setBranches(branchList);
        if (branchList.length > 0 && !formData.branchId) {
          setFormData(prev => ({ ...prev, branchId: branchList[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load staff manager details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (branchId) {
      setFormData(prev => ({ ...prev, branchId }));
    }
  }, [branchId]);

  const handleReviewLeave = async (leaveId: string, status: 'approved' | 'rejected') => {
    try {
      const updated = await reviewLeaveAction(leaveId, status) as any;
      if (updated) {
        setLeaves(leaves.map(l => l.id === leaveId ? { ...l, status: updated.status } : l));
        toast(`Leave request ${status}!`, 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Action failed.', 'error');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (staff.length >= 50) {
      toast('Staff account limit reached (max 50 accounts).', 'error');
      return;
    }
    if (!formData.name.trim()) {
      toast('Name is required.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      toast('Phone must be a 10-digit number.', 'error');
      return;
    }
    if (!/^\d{4}$/.test(formData.pin)) {
      toast('PIN must be exactly a 4-digit number.', 'error');
      return;
    }
    if (!formData.branchId) {
      toast('Please select a branch.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createStaffAction({
        name: formData.name.trim(),
        phone: formData.phone,
        role: formData.role,
        pin: formData.pin,
        branchId: formData.branchId,
      });

      if (res.success) {
        toast('Staff account created successfully! Credentials sent via WhatsApp.', 'success');
        setFormData({
          name: '',
          phone: '',
          role: 'staff',
          pin: '',
          branchId: branchId || (branches.length > 0 ? branches[0].id : ''),
        });
        setShowAddForm(false);
        loadData();
      }
    } catch (err: any) {
      toast(err.message || 'Failed to create staff account.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1e293b] animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Staffing & Attendance</h2>
          <p className="text-xs text-[#1e293b]/50">Manage terminal operators, register shifts, and approve leave calendars.</p>
        </div>
        <div className="flex bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'roster' ? 'bg-[#d97706] text-[#ffffff]' : 'text-[#1e293b]/40 hover:text-[#1e293b]/70'
            }`}
          >
            <UserCheck size={12} className="inline mr-1" />
            <span> Roster</span>
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'leaves' ? 'bg-[#d97706] text-[#ffffff]' : 'text-[#1e293b]/40 hover:text-[#1e293b]/70'
            }`}
          >
            <Calendar size={12} className="inline mr-1" />
            <span>Leave Requests</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#1e293b]/40">
          <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : activeSubTab === 'roster' ? (
        <div className="space-y-6">
          {/* Limits display & Add trigger */}
          <div className="flex justify-between items-center bg-[#f8fafc] border border-[#e2e8f0]/80 rounded-2xl p-4 shadow-sm">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#1e293b]/50">Staff Accounts limit</span>
              <p className="text-lg font-black">{staff.length} <span className="text-xs font-medium text-[#1e293b]/40">/ 50 active accounts</span></p>
            </div>
            <button
              disabled={staff.length >= 50}
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-[#d97706] hover:bg-[#b45309] text-white disabled:bg-[#e2e8f0] disabled:text-[#1e293b]/30 font-bold text-xs rounded-xl cursor-pointer transition-all shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Staff Member</span>
            </button>
          </div>

          {/* Add Staff form */}
          {showAddForm && (
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-3">
                <h3 className="font-extrabold text-sm text-[#1e293b] flex items-center gap-1.5">
                  <UserCheck size={16} className="text-[#d97706]" />
                  <span>Register Staff Member</span>
                </h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-[#1e293b]/40 hover:text-[#1e293b]/70 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[#1e293b]/60 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#d97706] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#1e293b]/60 mb-1">WhatsApp Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    pattern="[0-9]{10}"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#d97706] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#1e293b]/60 mb-1">Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#d97706] transition-all cursor-pointer"
                  >
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="staff">Waiter/Server</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#1e293b]/60 mb-1">Branch</label>
                  <select 
                    value={formData.branchId}
                    onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#d97706] transition-all cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#1e293b]/60 mb-1">4-Digit PIN Code (for POS login)</label>
                  <input 
                    type="password" 
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    placeholder="e.g. 1234"
                    value={formData.pin}
                    onChange={e => setFormData({ ...formData, pin: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#d97706] transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-[#e2e8f0] text-[#1e293b]/60 hover:bg-[#f1f5f9] rounded-xl cursor-pointer font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl cursor-pointer font-bold transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Staff Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((s) => (
              <div key={s.id} className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-[#e2e8f0]/80 transition-all gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#d97706]/10 flex items-center justify-center font-extrabold text-[#d97706]">
                    {s.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{s.full_name}</h4>
                    <span className="text-[10px] text-[#d97706] font-bold uppercase tracking-wider">{s.role}</span>
                  </div>
                </div>
                 <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#1e293b]/50">Phone: {s.phone || '—'}</span>
                    <button
                      onClick={() => handleToggleStatus(s.id, s.is_active)}
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-85 transition-all ${
                        s.is_active 
                          ? 'bg-green-500/15 text-green-600 border border-green-500/20' 
                          : 'bg-red-500/15 text-red-600 border border-red-500/20'
                      }`}
                      title="Click to toggle account status"
                    >
                      {s.is_active ? 'Active' : 'Suspended'}
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs border-t border-[#e2e8f0]/40 pt-2.5">
                    <span className="text-[#1e293b]/50 flex items-center gap-1">
                      <Lock size={12} className="text-[#ca8a04]" />
                      <span>POS PIN:</span>
                      <strong className="font-mono text-[#1e293b] font-bold text-sm tracking-widest">
                        {visiblePins[s.id] 
                          ? (s.pin_hash || '1111') 
                          : '••••'}
                      </strong>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinVisibility(s.id)}
                        className="p-1 text-[#1e293b]/40 hover:text-[#d97706] cursor-pointer"
                        title={visiblePins[s.id] ? "Hide PIN" : "Show PIN"}
                      >
                        {visiblePins[s.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleOpenChangePinModal(s)}
                        className="p-1 text-[#1e293b]/40 hover:text-[#d97706] cursor-pointer"
                        title="Change PIN"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Leaves Roster Table */
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0]/50 bg-[#f1f5f9]/30 text-xs font-bold text-[#1e293b]/40 tracking-wider uppercase">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Leave Type</th>
                  <th className="py-4 px-6">Date Coverage</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Approve Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]/30 text-sm">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#1e293b]/40">No leave requests submitted yet.</td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-[#f1f5f9]/20 transition-all">
                      <td className="py-4 px-6 font-bold">{l.staff_name}</td>
                      <td className="py-4 px-6 text-xs font-mono text-[#ca8a04] font-bold uppercase">{l.leave_type}</td>
                      <td className="py-4 px-6 text-xs text-[#1e293b]/60">
                        {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()} ({l.days_count} days)
                      </td>
                      <td className="py-4 px-6 text-xs text-[#1e293b]/60 max-w-[200px] truncate">{l.reason || '—'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          l.status === 'approved' ? 'bg-green-500/15 text-green-600' :
                          l.status === 'rejected' ? 'bg-red-500/15 text-red-600' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {l.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReviewLeave(l.id, 'approved')}
                              className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-[#ffffff] text-xs font-extrabold rounded-lg cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewLeave(l.id, 'rejected')}
                              className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-[#1e293b] text-xs font-extrabold rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {editingPinStaff && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-2xl space-y-4 max-w-sm w-full animate-fade-in text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-3 text-slate-800">
              <h3 className="font-extrabold text-sm text-[#1e293b] flex items-center gap-1.5">
                <Lock size={16} className="text-[#d97706]" />
                <span>Update POS PIN: {editingPinStaff.full_name}</span>
              </h3>
              <button 
                onClick={() => setEditingPinStaff(null)}
                className="text-[#1e293b]/40 hover:text-[#1e293b]/70 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-4 text-slate-800">
              <div>
                <label className="block text-[#1e293b]/60 mb-1">New 4-Digit PIN Code</label>
                <input 
                  type="password" 
                  required
                  maxLength={4}
                  pattern="[0-9]{4}"
                  placeholder="e.g. 5555"
                  value={newPinCode}
                  onChange={e => setNewPinCode(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 outline-none focus:border-[#d97706] text-[#1e293b] text-sm font-bold tracking-widest text-center transition-all"
                />
                <p className="text-[10px] text-[#1e293b]/40 mt-1">This PIN will be used for offline screen lock and terminal login.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPinStaff(null)}
                  className="px-4 py-2 border border-[#e2e8f0] text-[#1e293b]/60 hover:bg-[#f1f5f9] rounded-xl cursor-pointer font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPin}
                  className="px-5 py-2 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xl cursor-pointer font-bold transition-all disabled:opacity-50"
                >
                  {updatingPin ? 'Updating...' : 'Save PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      {toastItem && <div className="fixed bottom-6 right-6 p-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-2xl text-xs font-bold shadow-lg text-slate-800">{toastItem.msg}</div>}
    </div>
  );
}
