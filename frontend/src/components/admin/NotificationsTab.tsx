'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  Bell, Search, Trash2, Check, CheckSquare, Clock, Filter, 
  UserCheck, Receipt, ShoppingBag, PhoneCall, 
  RefreshCw, X 
} from 'lucide-react';

interface NotificationItem {
  id: string;
  tenant_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  sent_at: string;
  created_at?: string;
}

interface NotificationsTabProps {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  tenantId: string;
  toast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

export default function NotificationsTab({
  notifications,
  setNotifications,
  tenantId,
  toast
}: NotificationsTabProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  // Sync / Refresh function
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setNotifications(data || []);
      toast('Notifications updated', 'success');
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast('Failed to refresh notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Mark single as read/unread
  const toggleReadStatus = async (id: string, currentRead: boolean) => {
    try {
      const { error } = await supabase
        .from('notification_log')
        .update({ read: !currentRead })
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !currentRead } : n));
      toast(currentRead ? 'Marked as unread' : 'Marked as read', 'success');
    } catch (err) {
      console.error('Failed to update status:', err);
      toast('Failed to update notification', 'error');
    }
  };

  // Delete single notification
  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notification_log')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast('Notification deleted', 'success');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast('Failed to delete notification', 'error');
    }
  };

  // Mark all as read
  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('notification_log')
        .update({ read: true })
        .eq('tenant_id', tenantId)
        .eq('read', false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Failed to mark all read:', err);
      toast('Failed to mark all as read', 'error');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notification_log')
        .delete()
        .eq('tenant_id', tenantId);

      if (error) throw error;
      setNotifications([]);
      setConfirmClear(false);
      toast('All notifications cleared', 'success');
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      toast('Failed to clear notifications', 'error');
    }
  };

  // Map notification type to Icon & Color
  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'customer_checkin':
        return {
          icon: <UserCheck size={18} />,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-200/50',
          label: 'Customer Check-in'
        };
      case 'bill_created':
        return {
          icon: <Receipt size={18} />,
          color: 'text-amber-600',
          bg: 'bg-amber-50 border-amber-200/50',
          label: 'New Bill Generated'
        };
      case 'order_update':
        return {
          icon: <ShoppingBag size={18} />,
          color: 'text-blue-600',
          bg: 'bg-blue-50 border-blue-200/50',
          label: 'Order Update'
        };
      case 'staff_call':
      case 'customer_call':
        return {
          icon: <PhoneCall size={18} />,
          color: 'text-rose-600',
          bg: 'bg-rose-50 border-rose-200/50',
          label: 'Staff Call Request'
        };
      default:
        return {
          icon: <Bell size={18} />,
          color: 'text-slate-600',
          bg: 'bg-slate-50 border-slate-200/50',
          label: 'System Notification'
        };
    }
  };

  // Format relative timestamp
  const getRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    // Search query match
    const matchesSearch = searchQuery 
      ? (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (n.body || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // Status filter match
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'unread' ? !n.read : n.read;

    // Type filter match
    const matchesType = 
      typeFilter === 'all' ? true :
      typeFilter === 'staff_call' ? (n.type === 'staff_call' || n.type === 'customer_call') :
      n.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Derived stats
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.read).length;
  const staffCallCount = notifications.filter(n => n.type === 'staff_call' || n.type === 'customer_call').length;
  const checkinCount = notifications.filter(n => n.type === 'customer_checkin').length;

  return (
    <div className="space-y-6 text-[#1e293b] animate-fade-in pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e2e8f0]/50 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Notifications & Alerts</h2>
          <p className="text-xs text-[#1e293b]/50">Monitor, filter, and respond to staff calls, customer check-ins, and bills in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 bg-[#ffffff] hover:bg-[#f8fafc] text-xs font-bold rounded-xl cursor-pointer transition-all border border-[#e2e8f0] flex items-center gap-2 text-[#64748b] hover:text-[#1e293b]"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="px-3.5 py-2 bg-[#d97706]/10 hover:bg-[#d97706]/15 text-[#d97706] text-xs font-bold rounded-xl cursor-pointer transition-all border border-[#d97706]/30 flex items-center gap-2"
            >
              <CheckSquare size={14} />
              <span>Mark all read</span>
            </button>
          )}
          {totalCount > 0 && (
            <div className="relative">
              {confirmClear ? (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl p-1 absolute right-0 top-0 z-10 whitespace-nowrap shadow-md">
                  <button 
                    onClick={clearAllNotifications}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-[#ffffff] text-[10px] font-black rounded-lg cursor-pointer transition-all"
                  >
                    Confirm Clear
                  </button>
                  <button 
                    onClick={() => setConfirmClear(false)}
                    className="p-1 bg-[#ffffff] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg text-slate-500 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirmClear(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl cursor-pointer transition-all border border-rose-200/50 flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Bell size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Total Alerts</span>
            <p className="text-base font-black leading-tight">{totalCount}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Unread Alerts</span>
            <p className="text-base font-black leading-tight text-amber-600">{unreadCount}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <PhoneCall size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Staff Calls</span>
            <p className="text-base font-black leading-tight text-rose-600">{staffCallCount}</p>
          </div>
        </div>
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Check-ins</span>
            <p className="text-base font-black leading-tight text-emerald-600">{checkinCount}</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filters */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
            <input 
              type="text" 
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#d97706] transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#1e293b] p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex border border-[#e2e8f0] rounded-xl p-1 bg-[#f8fafc]">
            {(['all', 'unread', 'read'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                  statusFilter === status 
                    ? 'bg-[#ffffff] text-[#d97706] shadow-sm' 
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap border-t border-[#f1f5f9] pt-3.5">
          <span className="text-[10px] font-extrabold uppercase text-[#1e293b]/40 mr-1.5 flex items-center gap-1">
            <Filter size={10} />
            Filter By Type:
          </span>
          {[
            { key: 'all', label: 'All' },
            { key: 'customer_checkin', label: 'Check-ins' },
            { key: 'staff_call', label: 'Staff Calls' },
            { key: 'bill_created', label: 'Bills' },
            { key: 'order_update', label: 'Orders' }
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setTypeFilter(type.key)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                typeFilter === type.key
                  ? 'bg-[#d97706] text-[#ffffff] border-[#d97706] shadow-sm'
                  : 'bg-transparent text-[#64748b] border-[#e2e8f0] hover:text-[#1e293b] hover:border-[#cbd5e1]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-12 text-center text-[#1e293b]/40 shadow-sm">
            <Bell className="mx-auto text-[#1e293b]/10 mb-4" size={48} />
            <p className="text-sm font-extrabold text-[#1e293b]/70">No notifications found</p>
            <p className="text-xs text-[#1e293b]/40 mt-1">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your search query or filters.'
                : 'Any real-time alerts or events will be listed here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const style = getNotificationStyles(notif.type);
            return (
              <div 
                key={notif.id}
                className={`bg-[#ffffff] border rounded-2xl p-4 shadow-sm flex items-start gap-4 transition-all hover:border-[#e2e8f0]/80 relative ${
                  !notif.read ? 'border-l-4 border-l-[#d97706] border-[#e2e8f0]' : 'border-[#e2e8f0]'
                }`}
              >
                {/* Type Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${style.bg} ${style.color}`}>
                  {style.icon}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 pr-20">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-extrabold text-sm text-[#1e293b] leading-tight">
                      {notif.title}
                    </h4>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase border border-slate-200/50 scale-90 origin-left">
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed font-medium">
                    {notif.body}
                  </p>
                  
                  {/* Timestamp row */}
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#64748b] font-semibold">
                    <Clock size={11} />
                    <span>{getRelativeTime(notif.sent_at || notif.created_at || '')}</span>
                  </div>
                </div>

                {/* Floating Actions on the right */}
                <div className="flex items-center gap-1.5 absolute right-4 top-1/2 -translate-y-1/2">
                  <button 
                    onClick={() => toggleReadStatus(notif.id, notif.read)}
                    title={notif.read ? 'Mark as unread' : 'Mark as read'}
                    className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-center ${
                      notif.read 
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200' 
                        : 'bg-[#d97706]/5 hover:bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20'
                    }`}
                  >
                    <Check size={14} className={notif.read ? 'opacity-40' : 'stroke-[3]'} />
                  </button>
                  <button 
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete notification"
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 rounded-xl cursor-pointer transition-all flex items-center justify-center"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
