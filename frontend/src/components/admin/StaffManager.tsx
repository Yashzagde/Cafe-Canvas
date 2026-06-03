'use client';

import { useState, useEffect } from 'react';
import { getStaffListAction, clockInAction, clockOutAction, reviewLeaveAction, openShiftAction, closeShiftAction } from '@/app/admin/actions/staff.actions';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/admin/UIPrimitives';
import { UserCheck, Clock, ShieldAlert, Award, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';

interface StaffProfile {
  id: string;
  full_name: string;
  role: 'owner' | 'manager' | 'cashier' | 'kitchen' | 'staff';
  phone: string | null;
  is_active: boolean;
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
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'leaves'>('roster');

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
        // Map staff names to leave list
        const mappedLeaves: LeaveRequest[] = (leavesList as any[]).map(l => ({
          ...l,
          staff_name: staffList.find((s: any) => s.id === l.staff_id)?.full_name || 'Staff Member'
        }));
        setLeaves(mappedLeaves);
      }
    } catch (err) {
      console.error('Failed to load staff manager details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  return (
    <div className="space-y-6 text-[#fcfaf4] animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#262b38]/50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Staffing & Attendance</h2>
          <p className="text-xs text-[#fcfaf4]/50">Manage terminal operators, register shifts, and approve leave calendars.</p>
        </div>
        <div className="flex bg-[#1e222d] border border-[#262b38] rounded-xl p-1 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'roster' ? 'bg-[#e28743] text-[#151820]' : 'text-[#fcfaf4]/40 hover:text-[#fcfaf4]/70'
            }`}
          >
            <UserCheck size={12} className="inline mr-1" />
            <span> Roster</span>
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              activeSubTab === 'leaves' ? 'bg-[#e28743] text-[#151820]' : 'text-[#fcfaf4]/40 hover:text-[#fcfaf4]/70'
            }`}
          >
            <Calendar size={12} className="inline mr-1" />
            <span>Leave Requests</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#fcfaf4]/40">
          <span className="inline-block w-6 h-6 border-2 border-[#e28743] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : activeSubTab === 'roster' ? (
        /* Staff Grid layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((s) => (
            <div key={s.id} className="bg-[#151820] border border-[#262b38] rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-[#262b38]/80 transition-all gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e28743]/10 flex items-center justify-center font-extrabold text-[#e28743]">
                  {s.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{s.full_name}</h4>
                  <span className="text-[10px] text-[#e28743] font-bold uppercase tracking-wider">{s.role}</span>
                </div>
              </div>
              <div className="border-t border-[#262b38]/40 pt-3 flex justify-between items-center text-xs text-[#fcfaf4]/50">
                <span>Phone: {s.phone || '—'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${s.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {s.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Leaves Roster Table */
        <div className="bg-[#151820] border border-[#262b38] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262b38]/50 bg-[#1e222d]/30 text-xs font-bold text-[#fcfaf4]/40 tracking-wider uppercase">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Leave Type</th>
                  <th className="py-4 px-6">Date Coverage</th>
                  <th className="py-4 px-6">Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Approve Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262b38]/30 text-sm">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#fcfaf4]/40">No leave requests submitted yet.</td>
                  </tr>
                ) : (
                  leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-[#1e222d]/20 transition-all">
                      <td className="py-4 px-6 font-bold">{l.staff_name}</td>
                      <td className="py-4 px-6 text-xs font-mono text-[#f0a050] font-bold uppercase">{l.leave_type}</td>
                      <td className="py-4 px-6 text-xs text-[#fcfaf4]/60">
                        {new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()} ({l.days_count} days)
                      </td>
                      <td className="py-4 px-6 text-xs text-[#fcfaf4]/60 max-w-[200px] truncate">{l.reason || '—'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                          l.status === 'approved' ? 'bg-green-500/15 text-green-400' :
                          l.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
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
                              className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-[#151820] text-xs font-extrabold rounded-lg cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewLeave(l.id, 'rejected')}
                              className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-[#fcfaf4] text-xs font-extrabold rounded-lg cursor-pointer"
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

      {/* Toast Notification Container */}
      {toastItem && <div className="fixed bottom-6 right-6 p-4 bg-[#1e222d] border border-[#262b38] rounded-2xl text-xs font-bold">{toastItem.msg}</div>}
    </div>
  );
}
