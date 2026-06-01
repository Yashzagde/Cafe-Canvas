'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { UserRole } from '@/app/types';
import { supabase } from '@/app/utils/supabase';

const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

interface StaffMember {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: UserRole;
  active: boolean;
  avatar_initials: string;
  pin_set: boolean;
  orders_today: number;
  bills_today: number;
}

async function fetchStaff(): Promise<StaffMember[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, phone, role, active, pin_hash, avatar_url')
    .eq('tenant_id', TENANT_ID)
    .order('name');

  if (error) {
    console.error('[Staff] Error fetching:', error);
    return [];
  }

  return (data ?? []).map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    role: (u.role || 'staff') as UserRole,
    active: u.active !== false,
    avatar_initials: u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    pin_set: !!u.pin_hash,
    orders_today: 0,
    bills_today: 0,
  }));
}

const ROLE_COLORS: Record<UserRole, { bg: string; color: string; border: string }> = {
  owner:   { bg: 'rgba(155,89,182,0.1)', color: 'var(--accent-violet)', border: 'rgba(155,89,182,0.2)' },
  manager: { bg: 'rgba(77,124,254,0.1)', color: 'var(--accent-sapphire)', border: 'rgba(77,124,254,0.2)' },
  cashier: { bg: 'rgba(0,214,143,0.1)', color: 'var(--accent-emerald)', border: 'rgba(0,214,143,0.2)' },
  staff:   { bg: 'rgba(255,201,77,0.1)', color: 'var(--accent-amber)', border: 'rgba(255,201,77,0.2)' },
  kitchen: { bg: 'rgba(233,69,96,0.1)', color: 'var(--accent-crimson)', border: 'rgba(233,69,96,0.2)' },
};

const AVATAR_COLORS = ['#4d7cfe', '#00d68f', '#e94560', '#ffc94d', '#9b59b6'];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('staff');

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchStaff();
    setStaff(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredStaff = filterRole === 'all' ? staff : staff.filter(s => s.role === filterRole);
  const activeCount = staff.filter(s => s.active).length;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !invitePhone) return;

    const initials = inviteName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newMember: StaffMember = {
      id: `s${Date.now()}`,
      name: inviteName,
      email: null,
      phone: invitePhone,
      role: inviteRole,
      active: true,
      avatar_initials: initials,
      pin_set: false,
      orders_today: 0,
      bills_today: 0,
    };
    setStaff(prev => [...prev, newMember]);
    setShowInvite(false);
    setInviteName('');
    setInvitePhone('');
    setInviteRole('staff');
  };

  const toggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Staff & Roles</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {activeCount} active · {staff.length} total team members
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
          <span>+</span> Invite Staff
        </button>
      </div>

      {/* Role Filter Pills */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'owner', 'manager', 'cashier', 'staff', 'kitchen'] as const).map(r => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={{
              background: filterRole === r ? 'var(--accent-sapphire)' : 'rgba(255,255,255,0.04)',
              color: filterRole === r ? '#fff' : 'var(--text-secondary)',
              boxShadow: filterRole === r ? '0 2px 8px rgba(77,124,254,0.3)' : 'none',
            }}
          >
            {r === 'all' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredStaff.map((member, index) => {
          const rc = ROLE_COLORS[member.role];
          const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

          return (
            <div key={member.id} className="glass-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-sm"
                    style={{ background: `${avatarColor}20`, color: avatarColor, border: `1px solid ${avatarColor}30` }}
                  >
                    {member.avatar_initials}
                  </div>
                  <div>
                    <span className="text-sm font-bold block" style={{ color: member.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {member.name}
                    </span>
                    <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {member.email || member.phone}
                    </span>
                  </div>
                </div>
                <span className="status-badge" style={{
                  background: member.active ? 'rgba(0,214,143,0.1)' : 'rgba(255,255,255,0.04)',
                  color: member.active ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  border: `1px solid ${member.active ? 'rgba(0,214,143,0.2)' : 'var(--canvas-border)'}`,
                  fontSize: '8px',
                }}>
                  {member.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-2">
                <span className="status-badge" style={{
                  background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                  fontSize: '9px',
                }}>
                  {member.role.toUpperCase()}
                </span>
                {member.pin_set ? (
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--accent-emerald)' }}>
                    🔐 PIN Set
                  </span>
                ) : (
                  <span className="text-[9px] flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
                    ⚠ No PIN
                  </span>
                )}
              </div>

              {/* Stats */}
              {member.active && member.role !== 'kitchen' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-[9px] uppercase font-bold block" style={{ color: 'var(--text-muted)' }}>Orders Today</span>
                    <span className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{member.orders_today}</span>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-[9px] uppercase font-bold block" style={{ color: 'var(--text-muted)' }}>Bills Today</span>
                    <span className="font-heading font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{member.bills_today}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button className="btn-ghost flex-1 text-[10px]">
                  {member.pin_set ? 'Reset PIN' : 'Set PIN'}
                </button>
                <button
                  onClick={() => toggleActive(member.id)}
                  className={`flex-1 text-[10px] font-bold py-2 rounded-lg transition-all ${member.active ? 'btn-danger' : 'btn-success'}`}
                  style={!member.active ? { fontSize: '10px', padding: '8px 16px' } : { fontSize: '10px' }}
                >
                  {member.active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-30 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-base" style={{ color: 'var(--text-primary)' }}>Invite Staff Member</h3>
              <button onClick={() => setShowInvite(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
              }}>✕</button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} className="glass-input w-full px-3 py-2.5 text-xs" placeholder="e.g. Priya Singh" required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Phone Number</label>
                <input type="tel" value={invitePhone} onChange={e => setInvitePhone(e.target.value)} className="glass-input w-full px-3 py-2.5 text-xs" placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value as UserRole)} className="glass-input w-full px-3 py-2.5 text-xs">
                  <option value="staff">Staff</option>
                  <option value="cashier">Cashier</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1">Send Invite</button>
                <button type="button" onClick={() => setShowInvite(false)} className="btn-ghost">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
