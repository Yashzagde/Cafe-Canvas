'use client';

import { useState, useEffect, useRef } from 'react';
import { getTablesAction, createTableAction, updateTableAction, deleteTableAction, regenerateTableQRAction, rearrangeTablesAction } from '@/app/admin/actions/table.actions';
import { useToast } from '@/components/admin/UIPrimitives';
import { Layers, Plus, RefreshCw, Trash2, Printer, MapPin, Move, QrCode, X, Download } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import html2canvas from 'html2canvas';

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
  const supabase = createClient();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'floor' | 'list'>('floor');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableName, setTableName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState('Indoor');

  // Exporter & branding state
  const [branding, setBranding] = useState<{ name: string; slug: string; logoUrl: string | null; logoBase64: string | null } | null>(null);
  const [qrBase64s, setQrBase64s] = useState<Record<string, string>>({});
  const [selectedTableForQR, setSelectedTableForQR] = useState<Table | null>(null);
  const [showBulkQRModal, setShowBulkQRModal] = useState(false);
  const [downloadingTableId, setDownloadingTableId] = useState<string | null>(null);

  // Interactive Dragging and Section states
  const [activeSection, setActiveSection] = useState<string>('Indoor');
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [toastItem, toast] = useToast();

  // Helper: fetch image and convert to base64 to avoid CORS in html2canvas
  const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error('Failed to fetch image as base64:', err);
      return null;
    }
  };

  // Fetch active store/tenant branding
  useEffect(() => {
    async function fetchBranding() {
      if (!branchId) return;
      try {
        const { data: branch } = await supabase
          .from('branches')
          .select('name, tenant_id')
          .eq('id', branchId)
          .single();
          
        if (branch?.tenant_id) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('name, slug, logo_url')
            .eq('id', branch.tenant_id)
            .single();
            
          if (tenant) {
            let logoBase64: string | null = null;
            if (tenant.logo_url) {
              logoBase64 = await fetchImageAsBase64(tenant.logo_url);
            }
            setBranding({
              name: tenant.name || 'CafeCanvas',
              slug: tenant.slug || '',
              logoUrl: tenant.logo_url,
              logoBase64
            });
          }
        }
      } catch (err) {
        console.error('Failed to load store branding:', err);
      }
    }
    fetchBranding();
  }, [branchId]);

  // Pre-fetch all QR Codes as base64 to avoid CORS issues when downloading cards via html2canvas
  useEffect(() => {
    const loadBase64Qrs = async () => {
      const newBase64s: Record<string, string> = {};
      const host = typeof window !== 'undefined' ? window.location.host : 'cafecanvas.bar';
      const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
      const storefrontSlug = branding?.slug || 'store';

      for (const table of tables) {
        const tableUrl = `${protocol}//${host}/${storefrontSlug}?table=${table.id}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`;
        try {
          const res = await fetch(qrUrl);
          if (res.ok) {
            const blob = await res.blob();
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            newBase64s[table.id] = base64;
          }
        } catch (err) {
          console.error(`Failed to fetch QR base64 for table ${table.name}:`, err);
        }
      }
      setQrBase64s(prev => ({ ...prev, ...newBase64s }));
    };

    if (tables.length > 0 && branding?.slug) {
      loadBase64Qrs();
    }
  }, [tables, branding]);

  // Download QR Card as high-resolution PNG
  const downloadQRCard = async (table: Table) => {
    setDownloadingTableId(table.id);
    try {
      const element = document.getElementById(`qr-card-print-${table.id}`);
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 3, // High-DPI export
        useCORS: true,
        backgroundColor: '#FCFAF6',
        logging: false
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${table.name.replace(/\s+/g, '_')}_QR_Card.png`;
      link.href = image;
      link.click();
      toast('QR card downloaded successfully!', 'success');
    } catch (err) {
      console.error('Download failed:', err);
      toast('Failed to download QR card.', 'error');
    } finally {
      setDownloadingTableId(null);
    }
  };

  // Print single QR Card
  const printQRCard = (tableId: string) => {
    const cardElement = document.getElementById(`qr-card-print-${tableId}`);
    if (!cardElement) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let styles = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      styles += el.outerHTML;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table QR Card</title>
          ${styles}
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: white;
            }
            @page {
              size: 100mm 150mm;
              margin: 0mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div style="transform: scale(1.0); transform-origin: center;">
            ${cardElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 600);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Bulk print all QR Cards
  const printAllQRCards = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let styles = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      styles += el.outerHTML;
    });

    let cardsHtml = '';
    tables.forEach((table) => {
      const cardElement = document.getElementById(`qr-card-print-${table.id}`);
      if (cardElement) {
        cardsHtml += `
          <div class="print-page" style="page-break-after: always; break-after: page; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
            ${cardElement.innerHTML}
          </div>
        `;
      }
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bulk Table QR Cards</title>
          ${styles}
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: white;
            }
            .print-page {
              page-break-after: always;
              break-after: page;
            }
            .print-page:last-child {
              page-break-after: avoid;
              break-after: avoid;
            }
            @page {
              size: 100mm 150mm;
              margin: 0mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${cardsHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Shared component renderer for canvas/print cards
  const renderQRCardContent = (table: Table) => {
    const host = typeof window !== 'undefined' ? window.location.host : 'cafecanvas.bar';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const storefrontSlug = branding?.slug || 'store';
    const tableUrl = `${protocol}//${host}/${storefrontSlug}?table=${table.id}`;

    const qrSrc = qrBase64s[table.id] || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      tableUrl
    )}`;

    return (
      <div
        className="w-[340px] h-[520px] bg-[#FAF8F5] border-8 border-double border-[#d97706]/30 rounded-[32px] p-6 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden select-none"
        style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
      >
        <div className="absolute inset-2.5 border border-[#d97706]/15 rounded-[22px] pointer-events-none"></div>
        
        <div className="flex flex-col items-center gap-1 mt-4">
          {branding?.logoBase64 ? (
            <img 
              src={branding.logoBase64} 
              alt={branding.name} 
              className="w-14 h-14 rounded-full object-cover shadow-md border border-[#d97706]/20" 
            />
          ) : branding?.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt={branding.name} 
              className="w-14 h-14 rounded-full object-cover shadow-md border border-[#d97706]/20" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#d97706]/10 flex items-center justify-center font-black text-[#d97706] text-2xl border-2 border-[#d97706]/20 shadow-inner">
              {branding?.name ? branding.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <h3 className="font-extrabold text-[#1e293b] text-base tracking-wide mt-2 max-w-[280px] truncate">
            {branding?.name || 'CafeCanvas'}
          </h3>
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-[#d97706]/40 to-transparent my-0.5"></div>
          <p className="text-[9px] uppercase font-black text-[#d97706] tracking-[0.2em]">
            Order & Pay Dine-In
          </p>
        </div>

        <div className="my-1.5 bg-[#d97706]/5 border border-[#d97706]/20 rounded-2xl px-6 py-2 shadow-sm">
          <h4 className="text-xl font-black text-[#b45309] tracking-tight uppercase">
            {table.name}
          </h4>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-[24px] shadow-md border border-[#e2e8f0]/40 flex items-center justify-center w-[180px] h-[180px]">
          <img
            src={qrSrc}
            alt={`QR Code for ${table.name}`}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-1.5 mb-4 max-w-[280px]">
          <span className="text-[10px] uppercase font-black tracking-[0.15em] text-[#d97706] bg-amber-500/10 px-4 py-1.5 rounded-full">
            Scan QR Code
          </span>
          <p className="text-[9px] text-[#1e293b]/55 leading-relaxed font-semibold mt-1">
            Browse our fresh digital menu, customize your order, and complete payment directly from your seat.
          </p>
        </div>

        <div className="mb-2 text-[8px] font-bold text-[#1e293b]/30 uppercase tracking-[0.25em] flex items-center gap-1">
          <span>Powered by</span>
          <span className="text-[#d97706]">CafeCanvas</span>
        </div>
      </div>
    );
  };

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
            onClick={() => setShowBulkQRModal(true)}
            className="px-4 py-2 bg-[#ffffff] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-[#1e293b]/70 font-extrabold rounded-2xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer size={14} className="text-[#d97706]" />
            <span>Bulk Export QRs</span>
          </button>
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

                      <div className="flex justify-between items-end">
                        <span className="text-[9px] uppercase font-black tracking-widest opacity-75">
                          {t.status}
                        </span>
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTableForQR(t);
                          }}
                          className="p-1.5 bg-[#ffffff] hover:bg-[#d97706] hover:text-[#ffffff] text-[#d97706] rounded-lg border border-[#e2e8f0]/40 shadow-sm transition-all cursor-pointer relative z-10 flex items-center justify-center shrink-0"
                          title="View QR Card"
                        >
                          <QrCode size={10} />
                        </button>
                      </div>
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
                        <button
                          onClick={() => setSelectedTableForQR(t)}
                          className="px-3 py-1.5 bg-[#d97706]/10 border border-[#d97706]/20 text-[#d97706] hover:bg-[#d97706] hover:text-[#ffffff] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 inline-flex"
                        >
                          <QrCode size={12} />
                          <span>QR Card</span>
                        </button>
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

      {/* Single QR Card Modal Popup */}
      {selectedTableForQR && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-[400px] bg-[#ffffff] border border-[#e2e8f0] rounded-[36px] p-6 shadow-2xl flex flex-col items-center gap-6 relative">
            <button
              onClick={() => setSelectedTableForQR(null)}
              className="absolute top-4 right-4 p-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b]/60 rounded-full transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <h3 className="font-extrabold text-[#1e293b] text-base font-display text-center">
              Table QR Card Preview
            </h3>
            
            <div className="border border-[#e2e8f0]/80 rounded-[34px] p-2 bg-[#fdfcfb] shadow-sm">
              {renderQRCardContent(selectedTableForQR)}
            </div>
            
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={() => downloadQRCard(selectedTableForQR)}
                disabled={downloadingTableId !== null}
                className="flex items-center gap-2 px-5 py-3 bg-[#ffffff] border border-[#e2e8f0] hover:border-[#d97706]/40 text-[#1e293b]/80 hover:text-[#d97706] font-extrabold rounded-2xl text-xs transition-all cursor-pointer shadow-sm w-1/2 justify-center disabled:opacity-50"
              >
                <Download size={14} />
                <span>{downloadingTableId === selectedTableForQR.id ? 'Downloading...' : 'Download PNG'}</span>
              </button>
              <button
                onClick={() => printQRCard(selectedTableForQR.id)}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#d97706] to-[#ca8a04] hover:opacity-95 text-[#ffffff] font-extrabold rounded-2xl text-xs transition-all cursor-pointer shadow-md w-1/2 justify-center"
              >
                <Printer size={14} />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk QR Exporter Modal Popup */}
      {showBulkQRModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-[960px] max-h-[85vh] bg-[#ffffff] border border-[#e2e8f0] rounded-[36px] p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <button
              onClick={() => setShowBulkQRModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b]/60 rounded-full transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="border-b border-[#e2e8f0]/60 pb-4 mb-6">
              <h3 className="font-extrabold text-[#1e293b] text-xl font-display flex items-center gap-2">
                <Printer className="text-[#d97706]" />
                <span>Bulk QR Exporter</span>
              </h3>
              <p className="text-xs text-[#1e293b]/50 mt-1">
                Preview and print QR cards for all {tables.length} tables in this branch. Each card will print on its own page.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-h-[50vh]">
              {tables.map(table => (
                <div key={table.id} className="relative group border border-[#e2e8f0] rounded-[34px] p-2 bg-[#ffffff] shadow-md">
                  {renderQRCardContent(table)}
                  <div className="absolute inset-0 bg-[#ffffff]/0 hover:bg-[#ffffff]/85 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-3 rounded-[34px] transition-all duration-300">
                    <button
                      onClick={() => downloadQRCard(table)}
                      disabled={downloadingTableId !== null}
                      className="px-4 py-2 bg-[#ffffff] border border-[#e2e8f0] text-stone-700 hover:text-[#d97706] hover:border-[#d97706]/40 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download size={14} />
                      <span>{downloadingTableId === table.id ? 'Downloading...' : 'Download'}</span>
                    </button>
                    <button
                      onClick={() => printQRCard(table.id)}
                      className="px-4 py-2 bg-[#d97706] text-white hover:opacity-95 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Print Card</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 justify-end pt-6 mt-6 border-t border-[#e2e8f0]/60">
              <button
                onClick={() => setShowBulkQRModal(false)}
                className="px-5 py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b]/70 font-bold rounded-2xl text-xs cursor-pointer transition-all"
              >
                Close Exporter
              </button>
              <button
                onClick={printAllQRCards}
                className="px-6 py-2.5 bg-gradient-to-r from-[#d97706] to-[#ca8a04] hover:opacity-95 text-[#ffffff] font-extrabold rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer size={14} />
                <span>Print All ({tables.length} Cards)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen hidden container for printing/downloading */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        {tables.map(table => (
          <div key={table.id} id={`qr-card-print-${table.id}`}>
            {renderQRCardContent(table)}
          </div>
        ))}
      </div>

      {/* Toast Notification Container */}
      {toastItem && <div className="fixed bottom-6 right-6 p-4 bg-[#f1f5f9] border border-[#e2e8f0] rounded-2xl text-xs font-bold shadow-lg">{toastItem.msg}</div>}
    </div>
  );
}
