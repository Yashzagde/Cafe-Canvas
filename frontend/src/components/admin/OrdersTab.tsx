'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  ShoppingBag, Search, Clock, Play, CheckCircle2, 
  Check, XCircle, RefreshCw, Calendar, MapPin, User
} from 'lucide-react';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number; // in paise
  notes?: string;
  modifiers?: any[];
  kds_status?: string;
}

interface Order {
  id: string;
  tenant_id: string;
  location_id: string;
  table_id: string;
  session_id: string | null;
  staff_id: string | null;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'billed' | 'paid' | 'cancelled';
  subtotal: number; // in paise
  discount_amount: number; // in paise
  total: number; // in paise
  notes: string | null;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
  staff_accounts?: {
    name: string;
  } | null;
}

interface Table {
  id: string;
  name: string;
  table_number?: number;
  section?: string | null;
}

interface OrdersTabProps {
  orders: Order[]; // real-time active orders from parent
  tables: Table[];
  tenantId: string;
  branchId: string;
  toast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
  dbPending: boolean;
  onRefresh?: () => void;
}

export default function OrdersTab({
  orders,
  tables,
  tenantId,
  branchId,
  toast,
  dbPending,
  onRefresh
}: OrdersTabProps) {
  const supabase = createClient();
  const [view, setView] = useState<'live' | 'history'>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  
  // History tab states
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [histSearch, setHistSearch] = useState('');
  const [histStatus, setHistStatus] = useState<string>('all');
  const [histDate, setHistDate] = useState('');

  // Local staff cache mapping ID to Name
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadStaffNames() {
      if (!tenantId || dbPending) return;
      try {
        const { data, error } = await supabase
          .from('staff_accounts')
          .select('id, name')
          .eq('tenant_id', tenantId);
        
        if (data && !error) {
          const map: Record<string, string> = {};
          data.forEach(s => {
            map[s.id] = s.name;
          });
          setStaffMap(map);
        }
      } catch (err) {
        console.error('Failed to load staff list:', err);
      }
    }
    loadStaffNames();
  }, [tenantId, dbPending]);

  // Fetch older orders for the History view
  const fetchHistoryOrders = async () => {
    if (dbPending || !tenantId) return;
    setHistoryLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('tenant_id', tenantId)
        .eq('location_id', branchId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters for history
      if (histStatus && histStatus !== 'all') {
        query = query.eq('status', histStatus);
      } else {
        // By default show paid, served, billed, or cancelled in history
        query = query.in('status', ['paid', 'served', 'billed', 'cancelled']);
      }

      if (histDate) {
        const startOfDay = new Date(histDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(histDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.gte('created_at', startOfDay.toISOString()).lte('created_at', endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setHistoryOrders(data || []);
    } catch (err: any) {
      toast('Failed to load order history: ' + err.message, 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'history') {
      fetchHistoryOrders();
    }
  }, [view, histStatus, histDate, branchId]);

  // Quick Action: Update Order Status
  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      if (dbPending) {
        toast('Offline mode: Status cannot be updated.', 'warning');
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      toast(`Order status updated to ${nextStatus}`, 'success');
      
      // Trigger refresh in parent component to update states
      if (onRefresh) onRefresh();
      // Also refresh history if we are in history view
      if (view === 'history') fetchHistoryOrders();
    } catch (err: any) {
      toast('Failed to update status: ' + err.message, 'error');
    }
  };

  const getTableName = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table ? table.name : 'Table Guest';
  };

  const getTableSection = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.section || 'Indoor';
  };

  const formatCurrency = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const getMinutesAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    return `${diffMins}m ago`;
  };

  // Filter live orders
  const filteredLiveOrders = useMemo(() => {
    return orders.filter(order => {
      const tableName = getTableName(order.table_id).toLowerCase();
      const staffName = (order.staff_id ? staffMap[order.staff_id] || '' : '').toLowerCase();
      const orderIdShort = `#${order.id.substring(0, 4).toUpperCase()}`;
      const notes = (order.notes || '').toLowerCase();

      // Search match
      const matchesSearch = searchQuery
        ? tableName.includes(searchQuery.toLowerCase()) ||
          staffName.includes(searchQuery.toLowerCase()) ||
          orderIdShort.includes(searchQuery.toUpperCase()) ||
          notes.includes(searchQuery.toLowerCase())
        : true;

      // Status match
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed'].includes(order.status);
      } else if (statusFilter !== 'all') {
        matchesStatus = order.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter, tables, staffMap]);

  // Filter history orders locally by text search
  const filteredHistoryOrders = useMemo(() => {
    return historyOrders.filter(order => {
      const tableName = getTableName(order.table_id).toLowerCase();
      const staffName = (order.staff_id ? staffMap[order.staff_id] || '' : '').toLowerCase();
      const orderIdShort = `#${order.id.substring(0, 4).toUpperCase()}`;
      const notes = (order.notes || '').toLowerCase();

      return histSearch
        ? tableName.includes(histSearch.toLowerCase()) ||
          staffName.includes(histSearch.toLowerCase()) ||
          orderIdShort.includes(histSearch.toUpperCase()) ||
          notes.includes(histSearch.toLowerCase())
        : true;
    });
  }, [historyOrders, histSearch, tables, staffMap]);

  // Derive stats for live orders
  const stats = useMemo(() => {
    let pending = 0;
    let preparing = 0;
    let ready = 0;
    let total = 0;

    orders.forEach(o => {
      if (['pending', 'confirmed', 'preparing', 'ready', 'served', 'billed'].includes(o.status)) {
        total++;
        if (o.status === 'pending' || o.status === 'confirmed') pending++;
        else if (o.status === 'preparing') preparing++;
        else if (o.status === 'ready') ready++;
      }
    });

    return { pending, preparing, ready, total };
  }, [orders]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200/50', dot: 'bg-rose-500', label: 'Pending' };
      case 'preparing':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200/50', dot: 'bg-amber-500', label: 'Preparing' };
      case 'ready':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/50', dot: 'bg-emerald-500', label: 'Ready' };
      case 'served':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200/50', dot: 'bg-blue-500', label: 'Served' };
      case 'billed':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/50', dot: 'bg-indigo-500', label: 'Billed' };
      case 'paid':
        return { bg: 'bg-green-50 text-green-700 border-green-200/50', dot: 'bg-green-500', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400', label: 'Cancelled' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-500', label: status };
    }
  };

  return (
    <div className="space-y-6 text-[#1e293b] animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e2e8f0]/50 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Orders Operations</h2>
          <p className="text-xs text-[#1e293b]/50">Track live table orders, dispatch tickets to the kitchen, and manage order lifecycles.</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="px-3.5 py-2 bg-[#ffffff] hover:bg-[#f8fafc] text-xs font-bold rounded-xl cursor-pointer transition-all border border-[#e2e8f0] flex items-center gap-2 text-[#64748b] hover:text-[#1e293b]"
            >
              <RefreshCw size={14} />
              <span>Refresh Feed</span>
            </button>
          )}
          <div className="flex border border-[#e2e8f0] rounded-xl p-1 bg-[#f8fafc]">
            <button
              onClick={() => setView('live')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'live' 
                  ? 'bg-[#ffffff] text-[#d97706] shadow-sm' 
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              Live Monitor
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                view === 'history' 
                  ? 'bg-[#ffffff] text-[#d97706] shadow-sm' 
                  : 'text-[#64748b] hover:text-[#1e293b]'
              }`}
            >
              Order History
            </button>
          </div>
        </div>
      </div>

      {view === 'live' ? (
        <>
          {/* Stats Summary Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <ShoppingBag size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Total Active</span>
                <p className="text-base font-black leading-tight">{stats.total}</p>
              </div>
            </div>
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                <Clock size={18} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Pending Tickets</span>
                <p className="text-base font-black leading-tight text-rose-600">{stats.pending}</p>
              </div>
            </div>
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Play size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Preparing</span>
                <p className="text-base font-black leading-tight text-amber-600">{stats.preparing}</p>
              </div>
            </div>
            <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-650">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#1e293b]/40 block">Ready to Serve</span>
                <p className="text-base font-black leading-tight text-[#16a34a]">{stats.ready}</p>
              </div>
            </div>
          </div>

          {/* Toolbar: Search + Filter Tabs */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
                <input 
                  type="text" 
                  placeholder="Search live orders by table number, ID, waiter name, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#d97706] transition-all"
                />
              </div>

              <div className="flex border border-[#e2e8f0] rounded-xl p-1 bg-[#f8fafc] overflow-x-auto scrollbar-none">
                {[
                  { key: 'active', label: 'All Active' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'preparing', label: 'Preparing' },
                  { key: 'ready', label: 'Ready' },
                  { key: 'served', label: 'Served' },
                  { key: 'billed', label: 'Billed' },
                  { key: 'all', label: 'All Statuses' }
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => setStatusFilter(status.key)}
                    className={`px-4.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      statusFilter === status.key 
                        ? 'bg-[#ffffff] text-[#d97706] shadow-sm' 
                        : 'text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLiveOrders.length === 0 ? (
              <div className="col-span-full bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-12 text-center text-[#1e293b]/40 shadow-sm">
                <ShoppingBag className="mx-auto text-[#1e293b]/10 mb-4" size={48} />
                <p className="text-sm font-extrabold text-[#1e293b]/70">No active orders</p>
                <p className="text-xs text-[#1e293b]/40 mt-1">Any orders created in POS or storefront will appear here.</p>
              </div>
            ) : (
              filteredLiveOrders.map((order) => {
                const statusInfo = getStatusStyles(order.status);
                const tName = getTableName(order.table_id);
                const tSection = getTableSection(order.table_id);
                const itemsCount = (order.order_items || []).reduce((sum, i) => sum + i.quantity, 0);

                return (
                  <div 
                    key={order.id} 
                    className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Order Header Row */}
                      <div className="flex justify-between items-start gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-[#1e293b]">
                              #{order.id.substring(0, 4).toUpperCase()}
                            </span>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase border ${statusInfo.bg}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#64748b] mt-1">
                            <span className="flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                              <MapPin size={10} /> {tName} ({tSection})
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-700">
                              <User size={10} /> {order.staff_id ? staffMap[order.staff_id] || 'POS Station' : 'Customer / Storefront'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5 whitespace-nowrap">
                          <Clock size={11} />
                          <span>{getMinutesAgo(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Instructions/Notes */}
                      {order.notes && (
                        <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-xl text-xs font-semibold">
                          <span className="font-extrabold uppercase text-[9px] tracking-wider block text-amber-800 mb-0.5">Kitchen Instructions:</span>
                          "{order.notes}"
                        </div>
                      )}

                      {/* Items List */}
                      <div className="border-t border-[#f1f5f9] pt-3.5 mb-5">
                        <ul className="space-y-2.5">
                          {(order.order_items || []).map((item) => (
                            <li key={item.id} className="flex justify-between text-xs text-[#1e293b] font-semibold">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className="font-extrabold text-[#d97706] bg-[#d97706]/10 px-2 py-0.5 rounded text-[10px] h-fit">
                                  {item.quantity}x
                                </span>
                                <div className="min-w-0">
                                  <span className="truncate block font-bold leading-normal">{item.item_name}</span>
                                  {item.modifiers && item.modifiers.length > 0 && (
                                    <span className="text-[9px] text-amber-600 font-bold block mt-0.5">
                                      + {item.modifiers.map(m => `${m.group}: ${m.option}`).join(', ')}
                                    </span>
                                  )}
                                  {item.notes && (
                                    <span className="text-[9px] italic text-[#64748b] block mt-0.5">
                                      ✏️ "{item.notes}"
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-slate-500 ml-2">
                                {formatCurrency(item.unit_price * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Order Footer & Actions */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-extrabold text-[#1e293b] border-t border-[#f1f5f9] pt-3.5 mb-4">
                        <span className="text-[#64748b] text-[10px] uppercase tracking-wide">Total Revenue ({itemsCount} item{itemsCount !== 1 ? 's' : ''})</span>
                        <span className="text-sm font-black font-mono">{formatCurrency(order.total)}</span>
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'pending' || order.status === 'confirmed' ? (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1 bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold py-2 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Play size={12} fill="currentColor" />
                            <span>Start Preparing</span>
                          </button>
                        ) : null}

                        {order.status === 'preparing' ? (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold py-2 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <CheckCircle2 size={12} />
                            <span>Mark Ready</span>
                          </button>
                        ) : null}

                        {order.status === 'ready' ? (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'served')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Check size={14} className="stroke-[3]" />
                            <span>Mark Served</span>
                          </button>
                        ) : null}

                        {['pending', 'confirmed', 'preparing', 'ready'].includes(order.status) && (
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this order?')) {
                                updateOrderStatus(order.id, 'cancelled');
                              }
                            }}
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 hover:border-rose-200 rounded-xl transition-all flex items-center justify-center"
                            title="Cancel Order"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* History Search Filter Panel */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-extrabold uppercase text-[#1e293b]/40 mb-1.5 block">Search text</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={14} />
                  <input 
                    type="text" 
                    placeholder="Search past orders..."
                    value={histSearch}
                    onChange={(e) => setHistSearch(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#d97706] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#1e293b]/40 mb-1.5 block">Filter Status</label>
                <select 
                  value={histStatus}
                  onChange={(e) => setHistStatus(e.target.value)}
                  className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-3 py-1.5 text-xs font-bold outline-none text-[#1e293b]"
                >
                  <option value="all">All Past Orders</option>
                  <option value="paid">Paid / Settled</option>
                  <option value="served">Served</option>
                  <option value="billed">Billed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#1e293b]/40 mb-1.5 block">Order Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={histDate}
                    onChange={(e) => setHistDate(e.target.value)}
                    className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl px-3 py-1.5 text-xs font-bold outline-none text-[#1e293b] font-mono"
                  />
                  {histDate && (
                    <button 
                      onClick={() => setHistDate('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 text-[10px]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              <button 
                onClick={fetchHistoryOrders}
                disabled={historyLoading}
                className="px-4 py-2 bg-[#d97706]/10 hover:bg-[#d97706]/15 border border-[#d97706]/35 text-[#d97706] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <RefreshCw size={12} className={historyLoading ? 'animate-spin' : ''} />
                <span>Reload</span>
              </button>
            </div>
          </div>

          {/* History Orders List */}
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-sm">
            {historyLoading ? (
              <div className="p-16 text-center text-[#1e293b]/40">
                <RefreshCw className="mx-auto animate-spin mb-4 text-[#d97706]" size={32} />
                <p className="text-xs font-extrabold text-[#1e293b]/60 uppercase tracking-wider">Fetching historical data...</p>
              </div>
            ) : filteredHistoryOrders.length === 0 ? (
              <div className="p-16 text-center text-[#1e293b]/40">
                <Calendar className="mx-auto mb-4 text-[#1e293b]/10" size={48} />
                <p className="text-sm font-extrabold text-[#1e293b]/70">No historical orders found</p>
                <p className="text-xs text-[#1e293b]/40 mt-1">Try resetting dates or selecting another status.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-left">
                      {["Order ID", "Table", "Date & Time", "Placed By", "Status", "Items Count", "Total Revenue", "Actions"].map(h => (
                        <th key={h} className="p-4 text-[10px] font-extrabold text-[#64748b] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistoryOrders.map(order => {
                      const statusInfo = getStatusStyles(order.status);
                      const tName = getTableName(order.table_id);
                      const tSection = getTableSection(order.table_id);
                      const dateObj = new Date(order.created_at);
                      const itemsCount = (order.order_items || []).reduce((sum, i) => sum + i.quantity, 0);

                      return (
                        <tr key={order.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]/50 transition-colors">
                          <td className="p-4 text-xs font-extrabold text-[#1e293b] font-mono">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </td>
                          <td className="p-4 text-xs font-semibold text-[#1e293b]">
                            {tName} <span className="text-[10px] text-[#64748b] font-medium">({tSection})</span>
                          </td>
                          <td className="p-4 text-xs font-medium text-[#64748b]">
                            {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} · {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </td>
                          <td className="p-4 text-xs font-bold text-amber-700">
                            {order.staff_id ? staffMap[order.staff_id] || 'POS Station' : 'Customer'}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${statusInfo.bg}`}>
                              <span className={`w-1 h-1 rounded-full ${statusInfo.dot}`} />
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-semibold text-[#64748b] text-center">
                            {itemsCount}
                          </td>
                          <td className="p-4 text-xs font-black font-mono text-[#1e293b]">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="p-4">
                            {order.status !== 'cancelled' && order.status !== 'paid' && (
                              <button 
                                onClick={() => {
                                  if (confirm('Cancel this order?')) {
                                    updateOrderStatus(order.id, 'cancelled');
                                  }
                                }}
                                className="px-2.5 py-1 text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200/50 hover:bg-rose-100 rounded-lg transition-all"
                              >
                                Cancel Order
                              </button>
                            )}
                            {(order.status === 'cancelled' || order.status === 'paid') && (
                              <span className="text-[10px] font-semibold text-[#64748b] italic">No actions</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
