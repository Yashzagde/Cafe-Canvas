import { useEffect, useState } from 'react'
import { Package, Plus, AlertTriangle, Minus, PlusCircle, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useInventoryStore, type InventoryItem } from '../../store/inventory.store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/Table'
import { SearchInput } from '../../components/ui/SearchInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { cn, formatDate } from '../../lib/utils'

export function InventoryScreen() {
  const { tenantId } = useAuthStore()
  const { items, isLoading, fetchInventory, createItem, updateStock, deleteItem, getLowStockCount } = useInventoryStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [newUnit, setNewUnit] = useState('pcs')
  const [newStock, setNewStock] = useState('0')
  const [newReorder, setNewReorder] = useState('10')
  const [newSupplier, setNewSupplier] = useState('')

  useEffect(() => { if (tenantId) fetchInventory(tenantId) }, [tenantId, fetchInventory])

  const handleAdd = async () => {
    if (!tenantId || !newName.trim()) return
    await createItem(tenantId, { name: newName, unit: newUnit, current_stock: parseInt(newStock), reorder_level: parseInt(newReorder), supplier: newSupplier || undefined })
    setShowAddModal(false); setNewName(''); setNewStock('0')
  }

  const filteredItems = items.filter((i) => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const lowStockCount = getLowStockCount()

  const columns = [
    { key: 'name', header: 'Item', render: (i: InventoryItem) => (
      <div>
        <span className="text-xs font-bold text-canvas-brown">{i.name}</span>
        {i.supplier && <p className="text-[10px] text-canvas-brown_light">{i.supplier}</p>}
      </div>
    )},
    { key: 'current_stock', header: 'Stock', sortable: true, render: (i: InventoryItem) => (
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-extrabold', i.current_stock <= i.reorder_level ? 'text-canvas-error' : 'text-canvas-brown')}>
          {i.current_stock}
        </span>
        <span className="text-[10px] text-canvas-brown_light">{i.unit}</span>
        {i.current_stock <= i.reorder_level && <AlertTriangle className="w-3.5 h-3.5 text-canvas-error" />}
      </div>
    )},
    { key: 'reorder_level', header: 'Reorder At', render: (i: InventoryItem) => <span className="text-xs text-canvas-brown_mid">{i.reorder_level} {i.unit}</span> },
    { key: 'status', header: 'Status', render: (i: InventoryItem) => (
      i.current_stock <= i.reorder_level
        ? <Badge variant="danger" size="sm" dot>Low Stock</Badge>
        : i.current_stock <= i.reorder_level * 2
        ? <Badge variant="warning" size="sm">Warning</Badge>
        : <Badge variant="success" size="sm">In Stock</Badge>
    )},
    { key: 'adjust', header: 'Adjust', width: '100px', render: (i: InventoryItem) => (
      <div className="flex items-center gap-1">
        <button onClick={() => updateStock(i.id, Math.max(0, i.current_stock - 1))} className="p-1 rounded hover:bg-canvas-surface text-canvas-brown_mid"><Minus className="w-3.5 h-3.5" /></button>
        <span className="text-xs font-bold w-8 text-center">{i.current_stock}</span>
        <button onClick={() => updateStock(i.id, i.current_stock + 1)} className="p-1 rounded hover:bg-canvas-surface text-canvas-brown_mid"><PlusCircle className="w-3.5 h-3.5" /></button>
      </div>
    )},
    { key: 'last_restocked_at', header: 'Last Restocked', render: (i: InventoryItem) => <span className="text-xs text-canvas-brown_mid">{i.last_restocked_at ? formatDate(i.last_restocked_at, 'relative') : '—'}</span> },
    { key: 'actions', header: '', width: '40px', render: (i: InventoryItem) => (
      <button onClick={() => deleteItem(i.id)} className="p-1 rounded hover:bg-red-50 text-canvas-brown_light hover:text-canvas-error"><Trash2 className="w-3.5 h-3.5" /></button>
    )},
  ]

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Inventory</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">
            {items.length} items tracked
            {lowStockCount > 0 && <span className="text-canvas-error ml-2">· {lowStockCount} low stock alerts</span>}
          </p>
        </div>
        <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddModal(true)}>Add Item</Button>
      </div>

      {lowStockCount > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-canvas-error shrink-0" />
          <div>
            <p className="text-xs font-bold text-canvas-error">{lowStockCount} item{lowStockCount > 1 ? 's' : ''} below reorder level</p>
            <p className="text-[10px] text-red-600">Review and restock to avoid service disruptions.</p>
          </div>
        </div>
      )}

      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search inventory..." className="max-w-sm" />

      {filteredItems.length === 0 && !isLoading ? (
        <EmptyState icon={<Package className="w-8 h-8" />} title="No inventory items" description="Add items to track stock levels and get low-stock alerts." action={<Button size="sm" onClick={() => setShowAddModal(true)}>Add First Item</Button>} />
      ) : (
        <DataTable columns={columns} data={filteredItems} keyExtractor={(i) => i.id} loading={isLoading} />
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Inventory Item" size="sm" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button><Button onClick={handleAdd}>Add Item</Button></div>}>
        <div className="space-y-4">
          <Input label="Item Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Milk, Sugar, Cups" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Unit" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="pcs, kg, L" />
            <Input label="Current Stock" type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} />
          </div>
          <Input label="Reorder Level" type="number" value={newReorder} onChange={(e) => setNewReorder(e.target.value)} hint="Alert when stock falls below this" />
          <Input label="Supplier" value={newSupplier} onChange={(e) => setNewSupplier(e.target.value)} placeholder="Optional supplier name" />
        </div>
      </Modal>
    </div>
  )
}
