'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Clock, CheckCircle2, Coffee, AlertCircle, Play } from 'lucide-react';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  notes?: string;
  kds_status: 'pending' | 'preparing' | 'ready' | 'served';
}

interface Order {
  id: string;
  customer_name: string | null;
  customer_count: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'billed' | 'paid' | 'cancelled';
  created_at: string;
  notes: string | null;
  tables: {
    name: string;
  } | null;
  order_items: OrderItem[];
}

const SEED_TENANT_ID = 'a0000000-0000-0000-0000-000000000001'; // AETHER Café

const SEED_ORDERS: Order[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    customer_name: 'Amit Kumar',
    customer_count: 2,
    status: 'pending',
    created_at: new Date(Date.now() - 120000).toISOString(),
    notes: 'Avocado toast extra spicy please',
    tables: { name: 'Table 4' },
    order_items: [
      { id: '1', item_name: 'Avocado Sourdough Toast', quantity: 1, kds_status: 'pending' },
      { id: '2', item_name: 'Velvety Flat White', quantity: 2, notes: 'Oat Milk', kds_status: 'pending' }
    ]
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    customer_name: 'Sneha Patel',
    customer_count: 1,
    status: 'preparing',
    created_at: new Date(Date.now() - 300000).toISOString(),
    notes: null,
    tables: { name: 'Table 2' },
    order_items: [
      { id: '3', item_name: 'Signature Cold Brew', quantity: 1, kds_status: 'preparing' },
      { id: '4', item_name: 'Almond Butter Croissant', quantity: 1, kds_status: 'preparing' }
    ]
  }
];

export default function KOSDashboard() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tenantId, setTenantId] = useState(SEED_TENANT_ID);
  const [dbPending, setDbPending] = useState(false);
  const [time, setTime] = useState('');

  // Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch orders from database
  const fetchOrders = async () => {
    try {
      // Find current user tenant first if logged in
      const { data: { user } } = await supabase.auth.getUser();
      let activeTenantId = SEED_TENANT_ID;
      
      if (user && user.app_metadata && user.app_metadata.tenant_id) {
        activeTenantId = user.app_metadata.tenant_id;
      }
      setTenantId(activeTenantId);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_count,
          status,
          created_at,
          notes,
          tables (
            name
          ),
          order_items (
            id,
            item_name,
            quantity,
            notes,
            kds_status
          )
        `)
        .in('status', ['pending', 'confirmed', 'preparing'])
        .eq('tenant_id', activeTenantId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Type asserting table join from Supabase
      const typedOrders: Order[] = (data || []).map((o: any) => ({
        id: o.id,
        customer_name: o.customer_name,
        customer_count: o.customer_count,
        status: o.status,
        created_at: o.created_at,
        notes: o.notes,
        tables: o.tables ? { name: o.tables.name } : null,
        order_items: (o.order_items || []).map((i: any) => ({
          id: i.id,
          item_name: i.item_name,
          quantity: i.quantity,
          notes: i.notes,
          kds_status: i.kds_status
        }))
      }));

      setOrders(typedOrders);
      setDbPending(false);
    } catch (err: any) {
      console.error("KDS database fetch failed. Running in simulated state:", err.message);
      setOrders(SEED_ORDERS);
      setDbPending(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (dbPending) return;

    const channel = supabase
      .channel('kds-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${tenantId}` },
        () => {
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, dbPending]);

  const updateOrderStatus = async (orderId: string, nextStatus: 'preparing' | 'ready') => {
    try {
      if (dbPending) {
        // Simulated local update
        setOrders(prev => prev.map(o => {
          if (o.id === orderId) {
            if (nextStatus === 'ready') {
              // Remove ready orders from pending/preparing board
              return { ...o, status: 'ready' as const };
            }
            return { ...o, status: nextStatus as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'billed' | 'paid' | 'cancelled' };
          }
          return o;
        }).filter(o => o.status !== 'ready'));
        return;
      }

      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const getMinutesAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins <= 0 ? 'Just now' : `${diffMins}m ago`;
  };

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-zinc-400 flex flex-col justify-center items-center gap-4">
        <Coffee className="w-12 h-12 text-[#e05e35] animate-spin" />
        <span className="font-black text-xs tracking-widest uppercase opacity-75">Booting Kitchen Core...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f11] flex flex-col text-zinc-100 font-sans antialiased overflow-hidden select-none">
      {/* Database Warning Alert */}
      {dbPending && (
        <div className="bg-amber-500 text-stone-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-1.5 z-50 shadow-md">
          <AlertCircle size={14} />
          <span>KDS sandbox simulation active. Run <code>node db_setup.js</code> to connect live database events.</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#16161a] border-b border-zinc-800 p-4 flex justify-between items-center z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Coffee className="text-[#e05e35]" />
            Kitchen Display System
          </h1>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold animate-pulse border border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            LIVE FEED
          </div>
        </div>
        <div className="text-xl md:text-2xl font-black text-zinc-400 font-mono tracking-wider">
          {time}
        </div>
      </header>

      {/* Kanban Board columns */}
      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-hidden max-h-[calc(100vh-80px)]">
        
        {/* NEW TICKETS COLUMN */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between bg-red-500/10 p-3 rounded-xl border border-red-500/20">
            <h2 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              New Tickets
            </h2>
            <span className="bg-red-500/20 text-red-400 px-3 py-0.5 rounded-full text-xs font-black">
              {pendingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {pendingOrders.length === 0 ? (
              <div className="h-48 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-600 gap-2">
                <Coffee size={28} className="opacity-40" />
                <span className="text-xs font-bold uppercase tracking-wider">No pending orders</span>
              </div>
            ) : (
              pendingOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-[#16161a] border border-zinc-800 border-l-4 border-l-red-500 p-5 rounded-2xl shadow-xl hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-2xl font-black text-white">
                          #{order.id.substring(0, 4).toUpperCase()}
                        </div>
                        <div className="text-zinc-400 text-xs font-bold mt-0.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-black">
                            {order.tables?.name || 'Table Guest'}
                          </span>
                          {order.customer_name && (
                            <span className="opacity-80">· {order.customer_name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-red-400 text-xs font-black bg-red-500/10 px-2.5 py-1 rounded-full">
                        <Clock size={12} strokeWidth={3} /> 
                        <span>{getMinutesAgo(order.created_at)}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-extrabold flex gap-1.5 items-start">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>Notes: {order.notes}</span>
                      </div>
                    )}

                    <ul className="space-y-2.5 mb-5 border-t border-zinc-800/80 pt-3">
                      {order.order_items.map(item => (
                        <li key={item.id} className="flex justify-between text-base text-zinc-200 font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#e05e35] bg-[#e05e35]/10 px-2 py-0.5 rounded text-xs">
                              {item.quantity}x
                            </span>
                            <span>{item.item_name}</span>
                          </div>
                          {item.notes && (
                            <span className="text-xs text-amber-400 font-bold self-center bg-amber-500/15 px-2 py-0.5 rounded-full">
                              {item.notes}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="w-full bg-red-500 text-white font-extrabold py-3 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 border border-red-400/20"
                  >
                    <Play size={13} fill="currentColor" />
                    Start Preparing
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PREPARING COLUMN */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between bg-orange-500/10 p-3 rounded-xl border border-orange-500/20">
            <h2 className="text-sm font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              Preparing
            </h2>
            <span className="bg-orange-500/20 text-orange-400 px-3 py-0.5 rounded-full text-xs font-black">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {preparingOrders.length === 0 ? (
              <div className="h-48 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-600 gap-2">
                <Coffee size={28} className="opacity-40" />
                <span className="text-xs font-bold uppercase tracking-wider">No preparing orders</span>
              </div>
            ) : (
              preparingOrders.map(order => (
                <div 
                  key={order.id} 
                  className="bg-[#16161a] border border-zinc-800 border-l-4 border-l-orange-500 p-5 rounded-2xl shadow-xl hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-2xl font-black text-white">
                          #{order.id.substring(0, 4).toUpperCase()}
                        </div>
                        <div className="text-zinc-400 text-xs font-bold mt-0.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-black">
                            {order.tables?.name || 'Table Guest'}
                          </span>
                          {order.customer_name && (
                            <span className="opacity-80">· {order.customer_name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400 text-xs font-black bg-orange-500/10 px-2.5 py-1 rounded-full">
                        <Clock size={12} strokeWidth={3} />
                        <span>{getMinutesAgo(order.created_at)}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-4 p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-extrabold flex gap-1.5 items-start">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <span>Notes: {order.notes}</span>
                      </div>
                    )}

                    <ul className="space-y-2.5 mb-5 border-t border-zinc-800/80 pt-3">
                      {order.order_items.map(item => (
                        <li key={item.id} className="flex justify-between text-base text-zinc-200 font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded text-xs">
                              {item.quantity}x
                            </span>
                            <span>{item.item_name}</span>
                          </div>
                          {item.notes && (
                            <span className="text-xs text-amber-400 font-bold self-center bg-amber-500/15 px-2 py-0.5 rounded-full">
                              {item.notes}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="w-full bg-emerald-500 text-stone-950 font-extrabold py-3 rounded-xl shadow-lg hover:bg-emerald-400 active:scale-95 transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 border border-emerald-400/20"
                  >
                    <CheckCircle2 size={14} strokeWidth={3} />
                    Mark Ready
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
