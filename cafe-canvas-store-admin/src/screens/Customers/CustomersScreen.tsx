import { useEffect, useState } from 'react'
import { Phone, Mail, Plus, Calendar, IndianRupee } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useCustomersStore, type Customer } from '../../store/customers.store'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/Table'
import { SearchInput } from '../../components/ui/SearchInput'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { PriceDisplay } from '../../components/ui/PriceDisplay'
import { formatDate, formatRupees } from '../../lib/utils'

export function CustomersScreen() {
  const { tenantId } = useAuthStore()
  const { customers, selectedCustomer, isLoading, searchQuery, fetchCustomers, searchCustomers, createCustomer, selectCustomer, setSearchQuery } = useCustomersStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => { if (tenantId) fetchCustomers(tenantId) }, [tenantId, fetchCustomers])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (tenantId) { query ? searchCustomers(tenantId, query) : fetchCustomers(tenantId) }
  }

  const handleAdd = async () => {
    if (!tenantId || !newPhone.trim()) return
    await createCustomer(tenantId, { name: newName, phone: newPhone, email: newEmail })
    setShowAddModal(false)
    setNewName(''); setNewPhone(''); setNewEmail('')
  }

  const totalCustomers = customers.length
  const totalSpent = customers.reduce((s, c) => s + c.total_spent, 0)
  const avgVisits = totalCustomers > 0 ? Math.round(customers.reduce((s, c) => s + c.total_visits, 0) / totalCustomers) : 0

  const columns = [
    { key: 'name', header: 'Name', render: (c: Customer) => <span className="text-xs font-bold">{c.name || '—'}</span> },
    { key: 'phone', header: 'Phone', render: (c: Customer) => <span className="text-xs font-mono">{c.phone}</span> },
    { key: 'total_visits', header: 'Visits', sortable: true, render: (c: Customer) => <Badge variant="info" size="sm">{c.total_visits}</Badge> },
    { key: 'total_spent', header: 'Total Spent', sortable: true, render: (c: Customer) => <PriceDisplay paise={c.total_spent} compact size="sm" /> },
    { key: 'last_visit_at', header: 'Last Visit', render: (c: Customer) => <span className="text-xs text-canvas-brown_mid">{c.last_visit_at ? formatDate(c.last_visit_at, 'relative') : 'Never'}</span> },
  ]

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Customer CRM</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">{totalCustomers} customers · {formatRupees(totalSpent / 100)} total revenue</p>
        </div>
        <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowAddModal(true)}>Add Customer</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-canvas-teal text-white !border-canvas-teal/20">
          <p className="text-xs font-bold uppercase opacity-80">Total Customers</p>
          <p className="font-display text-2xl font-extrabold mt-2">{totalCustomers}</p>
        </Card>
        <Card className="bg-canvas-gold text-canvas-brown !border-canvas-gold/20">
          <p className="text-xs font-bold uppercase text-canvas-brown_mid">Avg Visits</p>
          <p className="font-display text-2xl font-extrabold mt-2">{avgVisits}</p>
        </Card>
        <Card><p className="text-xs font-bold uppercase text-canvas-brown_mid">Total Revenue</p>
          <p className="font-display text-2xl font-extrabold mt-2 text-canvas-brown">{formatRupees(totalSpent / 100)}</p>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <SearchInput value={searchQuery} onChange={handleSearch} placeholder="Search by phone or name..." className="max-w-sm" />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <DataTable columns={columns} data={customers} keyExtractor={(c) => c.id} onRowClick={(c) => selectCustomer(c)} selectedKey={selectedCustomer?.id} loading={isLoading} emptyMessage="No customers found." />
        </div>
        {selectedCustomer && (
          <div className="hidden xl:block w-80 shrink-0">
            <Card>
              <CardHeader title={selectedCustomer.name || 'Unknown'} subtitle={selectedCustomer.phone} />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs"><Phone className="w-3.5 h-3.5 text-canvas-brown_mid" /><span>{selectedCustomer.phone}</span></div>
                {selectedCustomer.email && <div className="flex items-center gap-2 text-xs"><Mail className="w-3.5 h-3.5 text-canvas-brown_mid" /><span>{selectedCustomer.email}</span></div>}
                <div className="flex items-center gap-2 text-xs"><Calendar className="w-3.5 h-3.5 text-canvas-brown_mid" /><span>Joined {formatDate(selectedCustomer.created_at)}</span></div>
                <div className="flex items-center gap-2 text-xs"><IndianRupee className="w-3.5 h-3.5 text-canvas-brown_mid" /><span>Spent <PriceDisplay paise={selectedCustomer.total_spent} compact size="sm" className="inline" /></span></div>
              </div>
              <div className="mt-4 pt-3 border-t border-canvas-border space-y-2">
                <div className="flex justify-between text-xs"><span className="text-canvas-brown_mid">Total visits</span><span className="font-bold">{selectedCustomer.total_visits}</span></div>
                <div className="flex justify-between text-xs"><span className="text-canvas-brown_mid">Last visit</span><span className="font-bold">{selectedCustomer.last_visit_at ? formatDate(selectedCustomer.last_visit_at, 'relative') : 'Never'}</span></div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Customer" size="sm" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button><Button onClick={handleAdd}>Add Customer</Button></div>}>
        <div className="space-y-4">
          <Input label="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 98765 43210" icon={<Phone className="w-4 h-4" />} />
          <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Customer name" />
          <Input label="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
        </div>
      </Modal>
    </div>
  )
}
