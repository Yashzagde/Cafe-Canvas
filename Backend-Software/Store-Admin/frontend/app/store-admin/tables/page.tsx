'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/app/utils/supabase';

// ─── Tenant Context ─────────────────────────────────
const TENANT_ID = 'a0000000-0000-0000-0000-000000000001';

interface FloorTable {
  id: string;
  name: string;
  capacity: number;
  section: string;
  shape: string;
  status: string;
  position_x: number;
  position_y: number;
}

async function fetchTables(): Promise<FloorTable[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('id, name, capacity, section, shape, status, position_x, position_y')
    .eq('tenant_id', TENANT_ID)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    console.error('[Tables] Error fetching:', error);
    return [];
  }

  return (data ?? []).map(t => ({
    id: t.id,
    name: t.name,
    capacity: t.capacity,
    section: t.section || 'Indoor',
    shape: t.shape || 'square',
    status: t.status || 'available',
    position_x: t.position_x || 0,
    position_y: t.position_y || 0,
  }));
}

export default function TablesPage() {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [tables, setTables] = useState<FloorTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchTables();
    setTables(data);

    // Extract unique sections
    const uniqueSections = [...new Set(data.map(t => t.section))].sort();
    setSections(uniqueSections);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription for table status changes
  useEffect(() => {
    const channel = supabase
      .channel('table-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tables', filter: `tenant_id=eq.${TENANT_ID}` },
        () => loadData()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  const handleDrag = async (id: string, dir: 'up' | 'down' | 'left' | 'right') => {
    const table = tables.find(t => t.id === id);
    if (!table) return;

    const newX = dir === 'left' ? Math.max(0, table.position_x - 20) : dir === 'right' ? table.position_x + 20 : table.position_x;
    const newY = dir === 'up' ? Math.max(0, table.position_y - 20) : dir === 'down' ? table.position_y + 20 : table.position_y;

    // Optimistic update
    setTables(prev => prev.map(t => t.id === id ? { ...t, position_x: newX, position_y: newY } : t));

    // Persist to Supabase
    const { error } = await supabase
      .from('tables')
      .update({ position_x: newX, position_y: newY, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[Tables] Position update error:', error);
      loadData(); // Revert
    }
  };

  const filteredTables = selectedSection === 'all'
    ? tables
    : tables.filter(t => t.section.toLowerCase() === selectedSection.toLowerCase());

  const statusColor = (status: string) => {
    switch (status) {
      case 'occupied': return { bg: 'rgba(233,69,96,0.1)', color: 'var(--accent-crimson)', border: 'rgba(233,69,96,0.2)' };
      case 'reserved': return { bg: 'rgba(255,165,0,0.1)', color: 'var(--accent-amber)', border: 'rgba(255,165,0,0.2)' };
      case 'cleaning': return { bg: 'rgba(155,89,182,0.1)', color: 'var(--accent-violet)', border: 'rgba(155,89,182,0.2)' };
      default: return { bg: 'rgba(0,214,143,0.1)', color: 'var(--accent-emerald)', border: 'rgba(0,214,143,0.2)' };
    }
  };

  if (loading && tables.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">Visual Floor Map</h2>
          <p className="text-sm text-neutral-400 mt-1">Loading tables from Supabase...</p>
        </div>
        <div className="glass-card p-6 h-[500px] flex items-center justify-center animate-pulse">
          <div className="text-neutral-500 text-sm">Loading floor plan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-white">Visual Floor Map</h2>
          <p className="text-sm text-neutral-400 mt-1">
            {tables.length} tables across {sections.length} sections • Live from Supabase
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition border border-white/10">
            ↻ Refresh
          </button>
          <button className="px-5 py-2.5 bg-accent-indigo hover:bg-accent-indigo/90 text-white rounded-xl text-xs font-bold transition">
            + Add Physical Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Settings and Sections Sidebar */}
        <div className="glass-card p-6 h-fit space-y-6">
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">Floor Sections</span>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSection('all')}
                className={`w-full text-left px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${selectedSection === 'all' ? 'bg-accent-indigo text-white shadow' : 'bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white'}`}
              >
                all ({tables.length})
              </button>
              {sections.map(sec => {
                const count = tables.filter(t => t.section.toLowerCase() === sec.toLowerCase()).length;
                return (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${selectedSection.toLowerCase() === sec.toLowerCase() ? 'bg-accent-indigo text-white shadow' : 'bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {sec} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Legend */}
          <div className="border-t border-border pt-4 space-y-2">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-2">Status Legend</span>
            {['available', 'occupied', 'reserved', 'cleaning'].map(status => {
              const colors = statusColor(status);
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: colors.color }} />
                  <span className="text-[11px] capitalize" style={{ color: 'var(--text-secondary)' }}>{status}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-4 text-xs text-neutral-400 leading-relaxed">
            <strong>Live mode.</strong> Table positions are saved to Supabase. Status changes from Staff POS update in real-time.
          </div>
        </div>

        {/* Visual Map Grid Area */}
        <div className="lg:col-span-3">
          <div className="glass-card p-6 h-[500px] relative overflow-hidden bg-white/[0.01] border-dashed border-2 border-white/10 flex items-center justify-center">

            {/* Background Grid Mesh */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {filteredTables.length === 0 ? (
              <p className="text-neutral-500 text-sm">No tables in this section.</p>
            ) : (
              filteredTables.map(tbl => {
                const colors = statusColor(tbl.status);
                return (
                  <div
                    key={tbl.id}
                    style={{ left: `${tbl.position_x}px`, top: `${tbl.position_y}px` }}
                    className="absolute w-36 h-36 rounded-2xl glass-card border p-4 flex flex-col justify-between shadow-xl cursor-move transition-all duration-300 hover:bg-white/5 bg-card"
                    title={`${tbl.name} — ${tbl.status}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">{tbl.name}</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded" style={{
                        background: colors.bg,
                        color: colors.color,
                        border: `1px solid ${colors.border}`,
                      }}>
                        {tbl.status}
                      </span>
                    </div>

                    <div className="flex justify-center my-2 text-neutral-500 font-display font-semibold text-xs">
                      {tbl.capacity} Seats • {tbl.section}
                    </div>

                    {/* Coordinate movement helper controls */}
                    <div className="flex items-center justify-between gap-1 mt-1">
                      <button onClick={() => handleDrag(tbl.id, 'left')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">◀</button>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleDrag(tbl.id, 'up')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">▲</button>
                        <button onClick={() => handleDrag(tbl.id, 'down')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">▼</button>
                      </div>
                      <button onClick={() => handleDrag(tbl.id, 'right')} className="w-5 h-5 bg-white/5 rounded flex items-center justify-center text-[10px] hover:bg-accent-indigo hover:text-white transition">▶</button>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
