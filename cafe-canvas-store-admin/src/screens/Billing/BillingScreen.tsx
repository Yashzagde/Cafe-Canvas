import { useEffect, useState } from 'react'
import { Receipt, CreditCard, Banknote, Smartphone, IndianRupee, FileText } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useBillingStore, type Bill } from '../../store/billing.store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card, CardHeader } from '../../components/ui/Card'
import { Tabs } from '../../components/ui/Tabs'
import { DataTable } from '../../components/ui/Table'
import { PriceDisplay, GSTBreakdown } from '../../components/ui/PriceDisplay'
import { Modal } from '../../components/ui/Modal'
import { formatDate, formatRupees } from '../../lib/utils'
import { PAYMENT_METHOD_LABELS, type BillStatus, type PaymentMethod, PAYMENT_METHODS } from '../../lib/constants'
import { useTenantStore } from '../../store/tenant.store'

export function BillingScreen() {
  const { tenantId } = useAuthStore()
  const { tenant } = useTenantStore()
  const { bills, selectedBill, isLoading, fetchBills, markPaid, voidBill, selectBill, subscribeToBills } = useBillingStore()
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'all'>('all')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  useEffect(() => {
    let unsub: (() => void) | undefined
    if (tenantId) {
      fetchBills(tenantId)
      unsub = subscribeToBills(tenantId)
    }
    return () => {
      if (unsub) unsub()
    }
  }, [tenantId, fetchBills, subscribeToBills])

  const filteredBills = statusFilter === 'all' ? bills : bills.filter((b) => b.status === statusFilter)

  const totalRevenue = bills.filter((b) => b.status === 'paid').reduce((sum, b) => sum + b.total, 0)
  const unpaidTotal = bills.filter((b) => b.status === 'unpaid').reduce((sum, b) => sum + b.total, 0)

  const tabs = [
    { id: 'all', label: 'All Bills', count: bills.length },
    { id: 'unpaid', label: 'Unpaid', count: bills.filter((b) => b.status === 'unpaid').length },
    { id: 'paid', label: 'Paid', count: bills.filter((b) => b.status === 'paid').length },
    { id: 'void', label: 'Voided', count: bills.filter((b) => b.status === 'void').length },
  ]

  const handlePayment = async (method: PaymentMethod) => {
    if (!selectedBill) return
    await markPaid(selectedBill.id, method)
    setShowPaymentModal(false)
  }

  const columns = [
    {
      key: 'id',
      header: 'Bill #',
      width: '120px',
      render: (bill: Bill) => (
        <span className="font-mono text-xs font-extrabold text-canvas-terracotta">
          #{bill.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'table_number',
      header: 'Table',
      render: (bill: Bill) => (
        <span className="text-xs font-bold">{bill.table_number ? `#${bill.table_number}` : '—'}</span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (bill: Bill) => <PriceDisplay paise={bill.total} compact size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (bill: Bill) => {
        return <Badge variant={bill.status === 'paid' ? 'success' : bill.status === 'void' ? 'danger' : 'warning'}>{bill.status}</Badge>
      },
    },
    {
      key: 'payment_method',
      header: 'Payment',
      render: (bill: Bill) => (
        <span className="text-xs text-canvas-brown_mid font-bold">
          {bill.payment_method ? PAYMENT_METHOD_LABELS[bill.payment_method] : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (bill: Bill) => (
        <span className="text-xs text-canvas-brown_mid">{formatDate(bill.created_at)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Billing & Invoices</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">
            GST-compliant bills with CGST + SGST breakdown
          </p>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-canvas-sage text-white !border-canvas-sage/20">
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Total Revenue (Paid)</p>
          <p className="font-display text-2xl font-extrabold mt-2">{formatRupees(totalRevenue / 100)}</p>
        </Card>
        <Card className="bg-canvas-gold text-canvas-brown !border-canvas-gold/20">
          <p className="text-xs font-bold uppercase tracking-wider text-canvas-brown_mid">Unpaid Bills</p>
          <p className="font-display text-2xl font-extrabold mt-2">{formatRupees(unpaidTotal / 100)}</p>
        </Card>
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-canvas-brown_mid">Total Bills</p>
          <p className="font-display text-2xl font-extrabold mt-2 text-canvas-brown">{bills.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={statusFilter} onChange={(id) => setStatusFilter(id as BillStatus | 'all')} />

      {/* Bills Table */}
      <div className="flex gap-4">
        <div className="flex-1">
          <DataTable
            columns={columns}
            data={filteredBills}
            keyExtractor={(b) => b.id}
            onRowClick={(b) => selectBill(b)}
            selectedKey={selectedBill?.id}
            loading={isLoading}
            emptyMessage="No bills found."
          />
        </div>

        {/* Detail panel */}
        {selectedBill && (
          <div className="hidden xl:block w-80 shrink-0">
            <Card>
              <CardHeader title={`Bill #${selectedBill.id.slice(-6).toUpperCase()}`} subtitle={formatDate(selectedBill.created_at, 'long')} />
              <GSTBreakdown
                subtotal={selectedBill.subtotal}
                cgst={selectedBill.cgst}
                sgst={selectedBill.sgst}
                total={selectedBill.total}
                discount={selectedBill.discount_amount}
                className="mb-4"
              />
              <div className="space-y-2">
                {selectedBill.status === 'unpaid' && (
                  <Button fullWidth icon={<CreditCard className="w-4 h-4" />} onClick={() => setShowPaymentModal(true)}>
                    Record Payment
                  </Button>
                )}
                <Button fullWidth variant="outline" icon={<FileText className="w-4 h-4" />} onClick={() => setShowReceiptModal(true)}>
                  View Receipt
                </Button>
                {selectedBill.status === 'unpaid' && (
                  <Button fullWidth variant="danger" size="sm" onClick={() => voidBill(selectedBill.id)}>
                    Void Bill
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment" size="sm">
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => handlePayment(method)}
              className="p-4 rounded-xl border-2 border-canvas-border bg-canvas-cream hover:border-canvas-terracotta hover:bg-canvas-terracotta/5 transition-all text-center"
            >
              {method === 'cash' && <Banknote className="w-6 h-6 mx-auto text-canvas-sage mb-2" />}
              {method === 'upi' && <Smartphone className="w-6 h-6 mx-auto text-canvas-teal mb-2" />}
              {method === 'card' && <CreditCard className="w-6 h-6 mx-auto text-canvas-terracotta mb-2" />}
              {method === 'razorpay' && <IndianRupee className="w-6 h-6 mx-auto text-canvas-gold mb-2" />}
              {method === 'other' && <Receipt className="w-6 h-6 mx-auto text-canvas-brown_mid mb-2" />}
              <p className="text-xs font-bold text-canvas-brown">{PAYMENT_METHOD_LABELS[method]}</p>
            </button>
          ))}
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} title="Receipt Preview" size="sm">
        {selectedBill && (
          <div className="print-receipt bg-white p-6 rounded-lg border border-canvas-border">
            <div className="text-center mb-4">
              <h2 className="font-display text-lg font-bold">{tenant?.name || 'CafeCanvas'}</h2>
              <p className="text-[10px] text-canvas-brown_mid">Tax Invoice / Receipt</p>
            </div>
            <div className="divider border-t border-dashed border-canvas-brown_light my-3" />
            <div className="text-xs space-y-1">
              <div className="flex justify-between"><span>Bill #</span><span className="font-bold">{selectedBill.id.slice(-6).toUpperCase()}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{formatDate(selectedBill.created_at)}</span></div>
              {selectedBill.table_number && <div className="flex justify-between"><span>Table</span><span>#{selectedBill.table_number}</span></div>}
            </div>
            <div className="divider border-t border-dashed border-canvas-brown_light my-3" />
            <GSTBreakdown subtotal={selectedBill.subtotal} cgst={selectedBill.cgst} sgst={selectedBill.sgst} total={selectedBill.total} discount={selectedBill.discount_amount} />
            <div className="divider border-t border-dashed border-canvas-brown_light my-3" />
            <p className="text-[10px] text-center text-canvas-brown_mid">Thank you for dining with us!</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
