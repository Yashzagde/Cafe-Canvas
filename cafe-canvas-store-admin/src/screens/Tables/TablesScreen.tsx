import { useEffect, useState } from 'react'
import { Plus, Grid3X3, Users, QrCode } from 'lucide-react'
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
  const [showQR, setShowQR] = useState<string | null>(null)

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
        <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => openModal()}>
          Add Table
        </Button>
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
                    <TableCard key={table.id} table={table} onEdit={() => openModal(table)} onStatusChange={updateTableStatus} onShowQR={() => setShowQR(table.qr_token || null)} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {tables.map((table) => (
                <TableCard key={table.id} table={table} onEdit={() => openModal(table)} onStatusChange={updateTableStatus} onShowQR={() => setShowQR(table.qr_token || null)} />
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

      {/* QR Code Modal */}
      <Modal
        isOpen={!!showQR}
        onClose={() => setShowQR(null)}
        title="QR Code"
        subtitle="Scan to access the digital menu for this table"
        size="sm"
      >
        <div className="flex flex-col items-center py-6">
          <div className="w-48 h-48 bg-white border-2 border-canvas-border rounded-xl flex items-center justify-center">
            <div className="text-center">
              <QrCode className="w-20 h-20 text-canvas-brown mx-auto" />
              <p className="text-[10px] text-canvas-brown_mid mt-2 font-bold">Token: {showQR?.slice(-8)}</p>
            </div>
          </div>
          <p className="text-xs text-canvas-brown_mid mt-4 text-center max-w-xs">
            Print this QR code and place it on the table. Customers can scan to view the menu and place orders.
          </p>
        </div>
      </Modal>
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
          table.status === 'vacant' ? 'success' :
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
            const nextStatus: TableStatus = table.status === 'vacant' ? 'occupied' : 'vacant'
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
