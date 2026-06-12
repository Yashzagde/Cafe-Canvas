import { useEffect, useState } from 'react'
import { Plus, Grid3X3, Users, QrCode, Download, Printer } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import html2canvas from 'html2canvas'
import { useAuthStore } from '../../store/auth.store'
import { useTablesStore, type RestaurantTable } from '../../store/tables.store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn } from '../../lib/utils'
import { TABLE_STATUS_COLORS, type TableStatus } from '../../lib/constants'

export function TablesScreen() {
  const { tenantId } = useAuthStore()
  const { tables, fetchTables, createTable, updateTable, updateTableStatus } = useTablesStore()

  const [showModal, setShowModal] = useState(false)
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null)
  const [tableNumber, setTableNumber] = useState('')
  const [capacity, setCapacity] = useState('4')
  const [section, setSection] = useState('')

  // Exporter & branding state
  const [branding, setBranding] = useState<{ name: string; slug: string; logoUrl: string | null; logoBase64: string | null } | null>(null)
  const [qrBase64s, setQrBase64s] = useState<Record<string, string>>({})
  const [selectedTableForQR, setSelectedTableForQR] = useState<RestaurantTable | null>(null)
  const [showBulkQRModal, setShowBulkQRModal] = useState(false)
  const [downloadingTableId, setDownloadingTableId] = useState<string | null>(null)

  // Helper: fetch image and convert to base64 to avoid CORS in html2canvas
  const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      const blob = await res.blob()
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })
    } catch (err) {
      console.error('Failed to fetch image as base64:', err)
      return null
    }
  }

  // Fetch active store/tenant branding
  useEffect(() => {
    async function fetchBranding() {
      if (!tenantId) return
      try {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('name, slug, logo_url')
          .eq('id', tenantId)
          .single()
          
        if (tenant) {
          let logoBase64: string | null = null
          if (tenant.logo_url) {
            logoBase64 = await fetchImageAsBase64(tenant.logo_url)
          }
          setBranding({
            name: tenant.name || 'CafeCanvas',
            slug: tenant.slug || '',
            logoUrl: tenant.logo_url,
            logoBase64
          })
        }
      } catch (err) {
        console.error('Failed to load store branding:', err)
      }
    }
    fetchBranding()
  }, [tenantId])

  // Pre-fetch all QR Codes as base64 to avoid CORS issues when downloading cards via html2canvas
  useEffect(() => {
    const loadBase64Qrs = async () => {
      const newBase64s: Record<string, string> = {}
      const storefrontSlug = branding?.slug || 'store'

      for (const table of tables) {
        const tableUrl = `https://cafecanvas.bar/${storefrontSlug}?table=${table.id}`
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`
        try {
          const res = await fetch(qrUrl)
          if (res.ok) {
            const blob = await res.blob()
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(blob)
            })
            newBase64s[table.id] = base64
          }
        } catch (err) {
          console.error(`Failed to fetch QR base64 for table ${table.table_number}:`, err)
        }
      }
      setQrBase64s(prev => ({ ...prev, ...newBase64s }))
    }

    if (tables.length > 0 && branding?.slug) {
      loadBase64Qrs()
    }
  }, [tables, branding])

  // Download QR Card as high-resolution PNG
  const downloadQRCard = async (table: RestaurantTable) => {
    setDownloadingTableId(table.id)
    try {
      const element = document.getElementById(`qr-card-print-${table.id}`)
      if (!element) return
      
      const canvas = await html2canvas(element, {
        scale: 3, // High-DPI export
        useCORS: true,
        backgroundColor: '#FCFAF6',
        logging: false
      })
      
      const image = canvas.toDataURL('image/png', 1.0)
      const link = document.createElement('a')
      link.download = `Table_${table.table_number}_QR_Card.png`
      link.href = image
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setDownloadingTableId(null)
    }
  }

  // Print single QR Card
  const printQRCard = (tableId: string) => {
    const cardElement = document.getElementById(`qr-card-print-${tableId}`)
    if (!cardElement) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    let styles = ''
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      styles += el.outerHTML
    })

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
    `)
    printWindow.document.close()
  }

  // Bulk print all QR Cards
  const printAllQRCards = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    let styles = ''
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
      styles += el.outerHTML
    })

    let cardsHtml = ''
    tables.forEach((table) => {
      const cardElement = document.getElementById(`qr-card-print-${table.id}`)
      if (cardElement) {
        cardsHtml += `
          <div class="print-page" style="page-break-after: always; break-after: page; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
            ${cardElement.innerHTML}
          </div>
        `
      }
    })

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
    `)
    printWindow.document.close()
  }

  // Shared component renderer for canvas/print cards
  const renderQRCardContent = (table: RestaurantTable) => {
    const storefrontSlug = branding?.slug || 'store'
    const tableUrl = `https://cafecanvas.bar/${storefrontSlug}?table=${table.id}`
    
    const qrSrc = qrBase64s[table.id] || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      tableUrl
    )}`

    return (
      <div
        className="w-[340px] h-[520px] bg-[#FAF8F5] border-8 border-double border-canvas-brown/30 rounded-[32px] p-6 shadow-2xl flex flex-col justify-between items-center text-center relative overflow-hidden select-none animate-fade-in text-canvas-brown"
        style={{ fontFamily: "'Outfit', 'Inter', sans-serif" }}
      >
        <div className="absolute inset-2.5 border border-canvas-brown/15 rounded-[22px] pointer-events-none"></div>
        
        <div className="flex flex-col items-center gap-1 mt-4">
          {branding?.logoBase64 ? (
            <img 
              src={branding.logoBase64} 
              alt={branding.name} 
              className="w-14 h-14 rounded-full object-cover shadow-md border border-canvas-brown/20" 
            />
          ) : branding?.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt={branding.name} 
              className="w-14 h-14 rounded-full object-cover shadow-md border border-canvas-brown/20" 
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-canvas-brown/10 flex items-center justify-center font-black text-canvas-brown text-2xl border-2 border-canvas-brown/20 shadow-inner">
              {branding?.name ? branding.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <h3 className="font-display font-extrabold text-canvas-brown text-base tracking-wide mt-2 max-w-[280px] truncate">
            {branding?.name || 'CafeCanvas'}
          </h3>
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-canvas-brown/40 to-transparent my-0.5"></div>
          <p className="text-[9px] uppercase font-black text-canvas-brown tracking-[0.2em]">
            Order & Pay Dine-In
          </p>
        </div>

        <div className="my-1.5 bg-canvas-brown/5 border border-canvas-brown/20 rounded-2xl px-6 py-2 shadow-sm">
          <h4 className="text-xl font-black text-canvas-brown tracking-tight uppercase">
            TABLE {table.table_number}
          </h4>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-[24px] shadow-md border border-canvas-border flex items-center justify-center w-[180px] h-[180px]">
          <img
            src={qrSrc}
            alt={`QR Code for Table ${table.table_number}`}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-1.5 mb-4 max-w-[280px]">
          <span className="text-[10px] uppercase font-black tracking-[0.15em] text-canvas-brown bg-canvas-brown/10 px-4 py-1.5 rounded-full">
            Scan QR Code
          </span>
          <p className="text-[9px] text-canvas-brown_mid leading-relaxed font-semibold mt-1">
            Browse our fresh digital menu, customize your order, and complete payment directly from your seat.
          </p>
        </div>

        <div className="mb-2 text-[8px] font-bold text-canvas-brown_mid/40 uppercase tracking-[0.25em] flex items-center gap-1">
          <span>Powered by</span>
          <span className="text-canvas-brown">CafeCanvas</span>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (tenantId) fetchTables(tenantId)
  }, [tenantId, fetchTables])

  const openModal = (table?: RestaurantTable) => {
    if (table) {
      setEditingTable(table)
      setTableNumber(table.table_number.toString())
      setCapacity(table.capacity.toString())
      setSection(table.section || '')
    } else {
      setEditingTable(null)
      const nextNum = tables.length > 0 ? Math.max(...tables.map((t) => t.table_number)) + 1 : 1
      setTableNumber(nextNum.toString())
      setCapacity('4')
      setSection('')
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!tenantId) return
    if (editingTable) {
      await updateTable(editingTable.id, {
        table_number: parseInt(tableNumber),
        capacity: parseInt(capacity),
        section: section || undefined,
      })
    } else {
      await createTable(tenantId, {
        table_number: parseInt(tableNumber),
        capacity: parseInt(capacity),
        section: section || undefined,
      })
    }
    setShowModal(false)
  }

  const statusCounts = tables.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  const sections = [...new Set(tables.map((t) => t.section).filter(Boolean))]

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Table Management</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">
            {tables.length} tables · {statusCounts['vacant'] || 0} vacant · {statusCounts['occupied'] || 0} occupied
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            icon={<Printer className="w-3.5 h-3.5" />} 
            onClick={() => setShowBulkQRModal(true)}
          >
            Bulk Export QRs
          </Button>
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => openModal()}>
            Add Table
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-4">
        {(['vacant', 'occupied', 'reserved', 'inactive'] as TableStatus[]).map((status) => {
          const colors = TABLE_STATUS_COLORS[status]
          const count = statusCounts[status] || 0
          return (
            <div key={status} className="flex items-center gap-2">
              <span className={cn('w-3 h-3 rounded-full', colors.dot)} />
              <span className="text-xs font-bold text-canvas-brown capitalize">{status}</span>
              <span className="text-xs text-canvas-brown_mid font-bold">({count})</span>
            </div>
          )
        })}
      </div>

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <EmptyState
          icon={<Grid3X3 className="w-8 h-8" />}
          title="No tables configured"
          description="Add tables to enable dine-in ordering and QR code generation."
          action={<Button size="sm" onClick={() => openModal()}>Add First Table</Button>}
        />
      ) : (
        <>
          {sections.length > 0 ? (
            sections.map((sect) => (
              <div key={sect}>
                <h3 className="text-xs font-extrabold text-canvas-brown uppercase tracking-wider mb-3">{sect}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {tables.filter((t) => t.section === sect).map((table) => (
                    <TableCard key={table.id} table={table} onEdit={() => openModal(table)} onStatusChange={updateTableStatus} onShowQR={() => setSelectedTableForQR(table)} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {tables.map((table) => (
                <TableCard key={table.id} table={table} onEdit={() => openModal(table)} onStatusChange={updateTableStatus} onShowQR={() => setSelectedTableForQR(table)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTable ? `Edit Table #${editingTable.table_number}` : 'Add New Table'}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingTable ? 'Save' : 'Create Table'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Table Number" type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
          <Input label="Capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} hint="Number of seats" />
          <Input label="Section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. Ground Floor, Terrace" />
        </div>
      </Modal>

      {/* Single Table QR Card Modal */}
      <Modal
        isOpen={!!selectedTableForQR}
        onClose={() => setSelectedTableForQR(null)}
        title="Table QR Card Preview"
        size="sm"
      >
        {selectedTableForQR && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="border border-canvas-border rounded-[34px] p-2 bg-[#fdfcfb] shadow-sm">
              {renderQRCardContent(selectedTableForQR)}
            </div>
            
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => downloadQRCard(selectedTableForQR)}
                disabled={downloadingTableId !== null}
                className="w-1/2 justify-center"
                icon={<Download className="w-4 h-4" />}
              >
                {downloadingTableId === selectedTableForQR.id ? 'Downloading...' : 'Download PNG'}
              </Button>
              <Button
                onClick={() => printQRCard(selectedTableForQR.id)}
                className="w-1/2 justify-center"
                icon={<Printer className="w-4 h-4" />}
              >
                Print Card
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Table QR Exporter Modal */}
      <Modal
        isOpen={showBulkQRModal}
        onClose={() => setShowBulkQRModal(false)}
        title="Bulk QR Exporter"
        subtitle={`Preview and print QR cards for all ${tables.length} tables.`}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowBulkQRModal(false)}>Close</Button>
            <Button onClick={printAllQRCards} icon={<Printer className="w-4 h-4" />}>
              Print All ({tables.length} Cards)
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center py-4">
          {tables.map((table) => (
            <div key={table.id} className="relative group border border-canvas-border rounded-[34px] p-2 bg-[#ffffff] shadow-md">
              {renderQRCardContent(table)}
              <div className="absolute inset-0 bg-[#ffffff]/0 hover:bg-[#ffffff]/85 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-3 rounded-[34px] transition-all duration-300">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadQRCard(table)}
                  disabled={downloadingTableId !== null}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  {downloadingTableId === table.id ? 'Downloading...' : 'Download'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => printQRCard(table.id)}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Print Card
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Off-screen hidden container for printing/downloading */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        {tables.map(table => (
          <div key={table.id} id={`qr-card-print-${table.id}`}>
            {renderQRCardContent(table)}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Table Card Component ──────────────────────────────────────────────────────

function TableCard({
  table,
  onEdit,
  onStatusChange,
  onShowQR,
}: {
  table: RestaurantTable
  onEdit: () => void
  onStatusChange: (id: string, status: TableStatus) => void
  onShowQR: () => void
}) {
  const colors = TABLE_STATUS_COLORS[table.status]

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer group',
        colors.bg,
        table.status === 'occupied' ? 'border-amber-300' :
        table.status === 'reserved' ? 'border-red-300' :
        table.status === 'inactive' ? 'border-gray-300' : 'border-emerald-300'
      )}
      onClick={onEdit}
    >
      {/* Status dot */}
      <span className={cn('absolute top-2 right-2 w-2.5 h-2.5 rounded-full', colors.dot)} />

      <div className="text-center">
        <p className="font-display text-2xl font-extrabold text-canvas-brown">{table.table_number}</p>
        <p className="text-[10px] text-canvas-brown_mid font-bold mt-0.5">
          <Users className="w-3 h-3 inline mr-0.5" />{table.capacity} seats
        </p>
        <Badge variant={
          table.status === 'vacant' || table.status === 'available' ? 'success' :
          table.status === 'occupied' ? 'warning' :
          table.status === 'reserved' ? 'danger' : 'neutral'
        } size="sm" className="mt-2">
          {table.status}
        </Badge>
      </div>

      {/* Quick actions on hover */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onShowQR() }}
          className="p-1 rounded bg-white/80 hover:bg-white shadow-sm text-canvas-brown_mid"
          title="Show QR"
        >
          <QrCode className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            const nextStatus: TableStatus = (table.status === 'vacant' || table.status === 'available') ? 'occupied' : 'vacant'
            onStatusChange(table.id, nextStatus)
          }}
          className="p-1 rounded bg-white/80 hover:bg-white shadow-sm text-canvas-brown_mid"
          title="Toggle status"
        >
          <Grid3X3 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
