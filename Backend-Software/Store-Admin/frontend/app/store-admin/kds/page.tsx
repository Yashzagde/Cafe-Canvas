'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/app/utils/supabase';

const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

/* ─── KDS Types ─── */

interface KdsOrder {
  id: string;
  table: string;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  createdAt: Date;
  status: 'pending' | 'preparing' | 'ready';
}

async function fetchKdsOrders(): Promise<KdsOrder[]> {
  // Fetch active orders with their items
  const { data: ordersData, error } = await supabase
    .from('orders')
    .select(`
      id,
      table_id,
      status,
      created_at,
      order_items (
        id,
        item_name,
        quantity,
        notes,
        kds_status
      )
    `)
    .eq('tenant_id', TENANT_ID)
    .in('status', ['open', 'sent_to_kitchen', 'ready'])
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[KDS] Error fetching orders:', error);
    return [];
  }

  if (!ordersData || ordersData.length === 0) return [];

  // Fetch table names
  const tableIds = [...new Set(ordersData.map(o => o.table_id).filter(Boolean))];
  const { data: tablesData } = tableIds.length > 0
    ? await supabase.from('tables').select('id, name').in('id', tableIds)
    : { data: [] };
  const tableMap = new Map((tablesData ?? []).map(t => [t.id, t.name]));

  // Map to KDS format
  return ordersData.map(order => {
    const items = (order.order_items || []).map((oi: any) => ({
      name: oi.item_name,
      quantity: oi.quantity,
      notes: oi.notes || undefined,
    }));

    // Determine KDS status from order status + item kds_status
    let kdsStatus: 'pending' | 'preparing' | 'ready' = 'pending';
    if (order.status === 'ready') {
      kdsStatus = 'ready';
    } else if (order.status === 'sent_to_kitchen') {
      const allReady = (order.order_items || []).every((oi: any) => oi.kds_status === 'ready');
      const anyPreparing = (order.order_items || []).some((oi: any) => oi.kds_status === 'preparing');
      if (allReady) kdsStatus = 'ready';
      else if (anyPreparing) kdsStatus = 'preparing';
      else kdsStatus = 'pending';
    }

    return {
      id: order.id.slice(0, 8).toUpperCase(),
      table: tableMap.get(order.table_id) || 'Walk-in',
      items,
      createdAt: new Date(order.created_at),
      status: kdsStatus,
    };
  });
}

export default function KDSPage() {
  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load orders from Supabase
  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchKdsOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime: refresh when orders or order_items change
  useEffect(() => {
    const channel = supabase
      .channel('kds-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `tenant_id=eq.${TENANT_ID}` }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  // Tick every second for elapsed timers
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Play chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      oscillator.type = 'sine';

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio not supported — silent
    }
  }, []);

  const getElapsed = (createdAt: Date) => {
    const diff = Math.floor((now.getTime() - createdAt.getTime()) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return { minutes: m, seconds: s, totalSeconds: diff };
  };

  const formatElapsed = (createdAt: Date) => {
    const { minutes, seconds } = getElapsed(createdAt);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const moveOrder = (id: string, to: 'preparing' | 'ready' | 'served') => {
    if (to === 'served') {
      setOrders(prev => prev.filter(o => o.id !== id));
      return;
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: to } : o));
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--text-primary)' }}>Kitchen Display</h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Live order routing — tap to advance order status.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-crimson)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Pending ({pendingOrders.length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-amber)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Preparing ({preparingOrders.length})</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--accent-emerald)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Ready ({readyOrders.length})</span>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* PENDING Column */}
        <div className="glass-card kds-pending rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(233,69,96,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-crimson)', animation: 'pulse 2s infinite' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-crimson)' }}>Pending</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full" style={{
              background: 'rgba(233,69,96,0.1)', color: 'var(--accent-crimson)',
            }}>{pendingOrders.length}</span>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {pendingOrders.map(order => (
              <KDSCard
                key={order.id}
                order={order}
                elapsed={getElapsed(order.createdAt)}
                formattedElapsed={formatElapsed(order.createdAt)}
                actionLabel="Start Preparing"
                actionColor="var(--accent-amber)"
                onAction={() => moveOrder(order.id, 'preparing')}
              />
            ))}
            {pendingOrders.length === 0 && <EmptyColumn label="No pending orders" />}
          </div>
        </div>

        {/* PREPARING Column */}
        <div className="glass-card kds-preparing rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,201,77,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-amber)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-amber)' }}>Preparing</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full" style={{
              background: 'rgba(255,201,77,0.1)', color: 'var(--accent-amber)',
            }}>{preparingOrders.length}</span>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {preparingOrders.map(order => (
              <KDSCard
                key={order.id}
                order={order}
                elapsed={getElapsed(order.createdAt)}
                formattedElapsed={formatElapsed(order.createdAt)}
                actionLabel="Mark Ready"
                actionColor="var(--accent-emerald)"
                onAction={() => moveOrder(order.id, 'ready')}
              />
            ))}
            {preparingOrders.length === 0 && <EmptyColumn label="Nothing cooking" />}
          </div>
        </div>

        {/* READY Column */}
        <div className="glass-card kds-ready rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(0,214,143,0.06)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-emerald)' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-emerald)' }}>Ready to Serve</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full" style={{
              background: 'rgba(0,214,143,0.1)', color: 'var(--accent-emerald)',
            }}>{readyOrders.length}</span>
          </div>
          <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {readyOrders.map(order => (
              <KDSCard
                key={order.id}
                order={order}
                elapsed={getElapsed(order.createdAt)}
                formattedElapsed={formatElapsed(order.createdAt)}
                actionLabel="Served ✓"
                actionColor="var(--accent-sapphire)"
                onAction={() => moveOrder(order.id, 'served')}
              />
            ))}
            {readyOrders.length === 0 && <EmptyColumn label="All served!" />}
          </div>
        </div>
      </div>
    </div>
  );
}

function KDSCard({
  order,
  elapsed,
  formattedElapsed,
  actionLabel,
  actionColor,
  onAction,
}: {
  order: KdsOrder;
  elapsed: { minutes: number; seconds: number; totalSeconds: number };
  formattedElapsed: string;
  actionLabel: string;
  actionColor: string;
  onAction: () => void;
}) {
  const isOverdue = elapsed.minutes >= 15;
  const isWarning = elapsed.minutes >= 10;

  return (
    <div className="rounded-xl p-4 transition-all" style={{
      background: 'var(--canvas-surface)',
      border: `1px solid ${isOverdue ? 'rgba(233,69,96,0.3)' : 'var(--canvas-border)'}`,
      boxShadow: isOverdue ? '0 0 12px rgba(233,69,96,0.1)' : 'none',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{order.table}</span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{
            background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)',
          }}>{order.id}</span>
        </div>
        <span className="text-xs font-mono font-bold" style={{
          color: isOverdue ? 'var(--accent-crimson)' : isWarning ? 'var(--accent-amber)' : 'var(--text-secondary)',
        }}>
          {formattedElapsed}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs font-bold font-mono w-5 text-right" style={{ color: 'var(--accent-sapphire)' }}>
              {item.quantity}×
            </span>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
              {item.notes && (
                <span className="text-[10px] block italic" style={{ color: 'var(--accent-amber)' }}>⚠ {item.notes}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <button
        onClick={onAction}
        className="w-full py-2 rounded-lg text-[11px] font-bold transition-all"
        style={{
          background: `${actionColor}15`,
          color: actionColor,
          border: `1px solid ${actionColor}30`,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = `${actionColor}25`; }}
        onMouseLeave={e => { e.currentTarget.style.background = `${actionColor}15`; }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}
