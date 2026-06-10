'use client';

import { useState, useEffect, useRef } from 'react';
import { getTablesAction, createTableAction, updateTableAction, deleteTableAction, regenerateTableQRAction, rearrangeTablesAction } from '@/app/admin/actions/table.actions';
import { useToast } from '@/components/admin/UIPrimitives';
import { Layers, Plus, RefreshCw, Trash2, Printer, MapPin, Move } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  capacity: number;
  section: string | null;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  floor_x: number;
  floor_y: number;
  qr_version: number;
}

interface TableQRManagerProps {
  branchId: string;
}

export default function TableQRManager({ branchId }: TableQRManagerProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'floor' | 'list'>('floor');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState('Indoor');

  // Interactive Dragging and Section states
  const [activeSection, setActiveSection] = useState<string>('Indoor');
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [toastItem, toast] = useToast();

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await getTablesAction(branchId);
      const typedData = data as Table[];
      setTables(typedData);
      
      // Auto-select first active section if current active section has no tables
      if (typedData.length > 0) {
        const sections = Array.from(new Set(typedData.map(t => t.section || 'Indoor')));
        if (sections.length > 0 && !sections.includes(activeSection)) {
          setActiveSection(sections[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (branchId) {
      loadTables();
    }
  }, [branchId]);

  // Derived helper arrays
  const sections = Array.from(new Set(tables.map(t => t.section || 'Indoor')));
  const filteredTables = tables.filter(t => (t.section || 'Indoor') === activeSection);

  const handleMouseDown = (e: React.MouseEvent, table: Table) => {
    e.preventDefault();
    setDraggingTableId(table.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ x: table.floor_x, y: table.floor_y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingTableId || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    const pctX = (dx / rect.width) * 100;
    const pctY = (dy / rect.height) * 100;
    
    const newX = Math.max(0, Math.min(Math.round(initialPos.x + pctX), 88));
    const newY = Math.max(0, Math.min(Math.round(initialPos.y + pctY), 88));
    
    setTables(prev => prev.map(t => t.id === draggingTableId ? { ...t, floor_x: newX, floor_y: newY } : t));
  };

  const handleMouseUp = async () => {
    if (!draggingTableId) return;
    
    const draggedTable = tables.find(t => t.id === draggingTableId);
    setDraggingTableId(null);
    
    if (draggedTable) {
      try {
        await rearrangeTablesAction([
          {
            id: draggedTable.id,
            floor_x: draggedTable.floor_x,
            floor_y: draggedTable.floor_y
          }
        ]);
        toast('Table position saved!', 'success');
      } catch (err) {
        console.error('Failed to save table position:', err);
        toast('Failed to save table position.', 'error');
      }
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTable = await createTableAction({
        name: tableName,
        capacity,
        section,
        shape: 'square',
        status: 'available',
        floor_x: 10,
        floor_y: 10,
        branch_id: branchId
      });
      if (newTable) {
        setTables([...tables, newTable as Table]);
        setShowAddModal(false);
        setTableName('');
        toast('Table created successfully!', 'success');
      }
    } catch (err) {
      toast('Failed to create table.', 'error');
    }
  };

  const handleRegenerateQR = async (tableId: string) => {
    try {
      const updated = await regenerateTableQRAction(tableId) as any;
      if (updated) {
        setTables(tables.map(t => t.id === tableId ? { ...t, qr_version: updated.qr_version } : t));
        toast('Table QR code regenerated!', 'success');
      }
    } catch (err) {
      toast('Failed to regenerate QR.', 'error');
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      const deleted = await deleteTableAction(tableId);
      if (deleted) {
        setTables(tables.filter(t => t.id !== tableId));
        toast('Table deleted.', 'success');
      }
    } catch (err) {
      toast('Failed to delete table.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-[#1e293b] animate-fade-in">
      <div className="flex items-center justify-between border-b border-[#e2e8f0]/50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold font-display">Floor Plan & Table QR Manager</h2>
          <p className="text-xs text-[#1e293b]/50">Position physical tables and export encrypted customer-ordering QR codes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('floor')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'floor' ? 'bg-[#d97706] text-[#ffffff]' : 'text-[#1e293b]/40 hover:text-[#1e293b]/70'
              }`}
            >
              <MapPin size={12} className="inline mr-1" />
              <span>Floor Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                activeTab === 'list' ? 'bg-[#d97706] text-[#ffffff]' : 'text-[#1e293b]/40 hover:text-[#1e293b]/70'
              }`}
            >
              <Layers size={12} className="inline mr-1" />
              <span>List View</span>
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#d97706] to-[#ca8a04] hover:opacity-95 text-[#ffffff] font-extrabold rounded-2xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[#1e293b]/40">
          <span className="inline-block w-6 h-6 border-2 border-[#d97706] border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : activeTab === 'floor' ? (
        /* Interactive Floor plan view grid */
        <div className="space-y-4">
          {/* Section Selector Tabs */}
          {sections.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-1">
              {sections.map((sec) => (
                <button
                  key={sec || 'Indoor'}
                  type="button"
                  onClick={() => setActiveSection(sec || 'Indoor')}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    activeSection === (sec || 'Indoor')
                      ? 'bg-amber-500/10 border-amber-500/25 text-[#d97706]'
                      : 'bg-[#ffffff] border-[#e2e8f0] text-[#1e293b]/50 hover:text-[#1e293b]'
                  }`}
                >
                  <MapPin size={12} className={activeSection === (sec || 'Indoor') ? 'text-[#d97706]' : 'text-[#1e293b]/30'} />
                  <span>{sec || 'Indoor'}</span>
                  <span className="text-[10px] opacity-60 bg-stone-100 px-1.5 py-0.5 rounded-full ml-1">
                    {tables.filter(t => (t.section || 'Indoor') === (sec || 'Indoor')).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full h-[520px] bg-[#fdfcf7] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-2xl p-6 flex items-center justify-center select-none"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
            
            {/* Helpful drag tooltip badge */}
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-xl bg-[#ffffff]/80 backdrop-blur border border-[#e2e8f0]/60 text-[10px] font-bold text-[#1e293b]/60 flex items-center gap-1.5 shadow-sm">
              <Move size={12} className="text-[#d97706]" />
              <span>Drag cards inside the grid to rearrange floor plan</span>
            </div>

            {filteredTables.length === 0 ? (
              <span className="text-xs text-[#1e293b]/30 uppercase tracking-widest font-semibold relative z-10">
                No tables in this section. Add tables to design your layout.
              </span>
            ) : (
              <div className="relative w-full h-full">
                {filteredTables.map((t) => {
                  const statusColors = {
                    available: 'border-green-500/30 bg-green-500/10 text-green-600',
                    occupied: 'border-red-500/30 bg-red-500/10 text-red-650',
                    reserved: 'border-blue-500/30 bg-blue-500/10 text-blue-500',
                    cleaning: 'border-purple-500/30 bg-purple-500/10 text-purple-650'
                  };
                  const isDragging = draggingTableId === t.id;
                  return (
                    <div
                      key={t.id}
                      onMouseDown={(e) => handleMouseDown(e, t)}
                      className={`absolute p-4 border rounded-2xl w-28 h-28 flex flex-col justify-between shadow-lg hover:border-[#d97706]/60 transition-all cursor-move active:scale-95 group ${
                        isDragging ? 'border-[#d97706] ring-2 ring-[#d97706]/20 bg-amber-500/5 z-30 scale-105' : statusColors[t.status]
                      }`}
                      style={{
                        left: `${t.floor_x}%`,
                        top: `${t.floor_y}%`,
                        touchAction: 'none'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-xs tracking-tight truncate max-w-[70px]" title={t.name}>{t.name}</span>
                        <span className="text-[9px] font-black opacity-55 flex items-center gap-0.5 shrink-0 bg-[#ffffff]/60 px-1 py-0.5 rounded">
                          {t.capacity}P
                        </span>
                      </div>
                      
                      {/* Drag overlay icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Move className="w-5 h-5 text-[#d97706]/40" />
                      </div>

                      <span className="text-[9px] uppercase font-black tracking-widest opacity-75">
                        {t.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Detailed List data table view */
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0]/50 bg-[#f1f5f9]/30 text-xs font-bold text-[#1e293b]/40 tracking-wider uppercase">
                  <th className="py-4 px-6">Table Identifier</th>
                  <th className="py-4 px-6">Layout Zone</th>
                  <th className="py-4 px-6">Guest Cap</th>
                  <th className="py-4 px-6">QR Version</th>
                  <th className="py-4 px-6">QR Code Link</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]/30 text-sm">
                {tables.map((t) => {
                  const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(
                    `https://cafecanvas.bar/table/${t.id}?v=${t.qr_version}`
                  )}`;
                  return (
                    <tr key={t.id} className="hover:bg-[#f1f5f9]/20 transition-all">
                      <td className="py-4 px-6 font-bold text-[#1e293b]/85">{t.name}</td>
                      <td className="py-4 px-6 font-mono text-xs text-[#1e293b]/50">{t.section || 'Indoor'}</td>
                      <td className="py-4 px-6 font-semibold">{t.capacity} Diner seats</td>
                      <td className="py-4 px-6 font-mono text-xs text-[#d97706] font-bold">V.{t.qr_version}</td>
                      <td className="py-4 px-6">
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#d97706] hover:underline text-xs font-bold"
                        >
                          View QR Image
                        </a>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleRegenerateQR(t.id)}
                          className="p-2 bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#d97706]/50 text-[#1e293b]/60 hover:text-[#d97706] rounded-xl cursor-pointer"
                          title="Regenerate QR (Voids old code)"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTable(t.id)}
                          className="p-2 bg-[#f1f5f9] border border-red-950 hover:bg-red-500/10 text-red-600 rounded-xl cursor-pointer"
                          title="Delete Table"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Table Modal Popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 animate-fade-in">
          <form onSubmit={handleAddTable} className="w-full max-w-md bg-[#ffffff] border border-[#e2e8f0] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold font-display border-b border-[#e2e8f0]/50 pb-2">Add Layout Table</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1e293b]/50">Table Name/Number</label>
              <input
                type="text"
                required
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. Table 15"
                className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1e293b]/50">Seating Capacity</label>
              <input
                type="number"
                required
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                min={1}
                className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#1e293b]/50">Floor Zone Section</label>
              <input
                type="text"
                required
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Terrace"
                className="w-full px-4 py-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:border-[#d97706]"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#f1f5f9]/80 text-[#1e293b]/70 font-bold rounded-2xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#d97706] to-[#ca8a04] text-[#ffffff] font-extrabold rounded-2xl text-xs cursor-pointer"
              >
                Save Table
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
