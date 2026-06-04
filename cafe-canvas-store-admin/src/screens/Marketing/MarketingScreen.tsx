import { useEffect, useState } from 'react'
import { Plus, Percent, Ticket, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useMarketingStore, type Discount, type Coupon } from '../../store/marketing.store'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { DataTable } from '../../components/ui/Table'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { formatINRCompact, formatDate } from '../../lib/utils'

type MarketingTab = 'discounts' | 'coupons'

export function MarketingScreen() {
  const { tenantId } = useAuthStore()
  const { discounts, coupons, isLoading, fetchDiscounts, fetchCoupons, createDiscount, updateDiscount, deleteDiscount, createCoupon, deleteCoupon } = useMarketingStore()
  const [activeTab, setActiveTab] = useState<MarketingTab>('discounts')
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [discName, setDiscName] = useState('')
  const [discType, setDiscType] = useState<'flat' | 'percentage'>('percentage')
  const [discValue, setDiscValue] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscountId, setCouponDiscountId] = useState('')
  const [couponMaxUses, setCouponMaxUses] = useState('100')

  useEffect(() => { if (tenantId) { fetchDiscounts(tenantId); fetchCoupons(tenantId) } }, [tenantId, fetchDiscounts, fetchCoupons])

  const handleCreateDiscount = async () => {
    if (!tenantId || !discName.trim()) return
    await createDiscount(tenantId, { name: discName, type: discType, value: discType === 'flat' ? Math.round(parseFloat(discValue) * 100) : parseFloat(discValue) })
    setShowDiscountModal(false); setDiscName(''); setDiscValue('')
  }

  const handleCreateCoupon = async () => {
    if (!tenantId || !couponCode.trim() || !couponDiscountId) return
    await createCoupon(tenantId, { code: couponCode.toUpperCase(), discount_id: couponDiscountId, max_uses: parseInt(couponMaxUses) || 100 })
    setShowCouponModal(false); setCouponCode(''); setCouponDiscountId('')
  }

  const tabs = [
    { id: 'discounts', label: 'Discounts', icon: <Percent className="w-3.5 h-3.5" />, count: discounts.length },
    { id: 'coupons', label: 'Coupon Codes', icon: <Ticket className="w-3.5 h-3.5" />, count: coupons.length },
  ]

  const discountColumns = [
    { key: 'name', header: 'Name', render: (d: Discount) => <span className="text-xs font-bold">{d.name}</span> },
    { key: 'type', header: 'Type', render: (d: Discount) => <Badge variant={d.type === 'flat' ? 'info' : 'warning'} size="sm">{d.type === 'flat' ? 'Flat' : '%'}</Badge> },
    { key: 'value', header: 'Value', render: (d: Discount) => <span className="text-xs font-bold text-canvas-terracotta">{d.type === 'flat' ? formatINRCompact(d.value) : `${d.value}%`}</span> },
    { key: 'is_active', header: 'Status', render: (d: Discount) => (
      <button onClick={() => updateDiscount(d.id, { is_active: !d.is_active })} className="text-canvas-brown_mid hover:text-canvas-brown">
        {d.is_active ? <ToggleRight className="w-5 h-5 text-canvas-sage" /> : <ToggleLeft className="w-5 h-5" />}
      </button>
    )},
    { key: 'actions', header: '', width: '40px', render: (d: Discount) => (
      <button onClick={() => deleteDiscount(d.id)} className="p-1 rounded hover:bg-red-50 text-canvas-brown_light hover:text-canvas-error"><Trash2 className="w-3.5 h-3.5" /></button>
    )},
  ]

  const couponColumns = [
    { key: 'code', header: 'Code', render: (c: Coupon) => <span className="font-mono text-xs font-extrabold text-canvas-terracotta">{c.code}</span> },
    { key: 'current_uses', header: 'Used', render: (c: Coupon) => <span className="text-xs font-bold">{c.current_uses}/{c.max_uses}</span> },
    { key: 'is_active', header: 'Active', render: (c: Coupon) => <Badge variant={c.is_active ? 'success' : 'neutral'} size="sm">{c.is_active ? 'Active' : 'Inactive'}</Badge> },
    { key: 'expires_at', header: 'Expires', render: (c: Coupon) => <span className="text-xs text-canvas-brown_mid">{c.expires_at ? formatDate(c.expires_at) : 'Never'}</span> },
    { key: 'actions', header: '', width: '40px', render: (c: Coupon) => (
      <button onClick={() => deleteCoupon(c.id)} className="p-1 rounded hover:bg-red-50 text-canvas-brown_light hover:text-canvas-error"><Trash2 className="w-3.5 h-3.5" /></button>
    )},
  ]

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-canvas-brown">Marketing</h2>
          <p className="text-xs text-canvas-brown_mid font-medium mt-1">Discounts, coupons, and promotions</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'discounts' && <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowDiscountModal(true)}>New Discount</Button>}
          {activeTab === 'coupons' && <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setShowCouponModal(true)}>New Coupon</Button>}
        </div>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as MarketingTab)} />

      {activeTab === 'discounts' && (
        discounts.length === 0 ? <EmptyState icon={<Percent className="w-8 h-8" />} title="No discounts" description="Create discounts to offer deals to customers." action={<Button size="sm" onClick={() => setShowDiscountModal(true)}>Create Discount</Button>} />
        : <DataTable columns={discountColumns} data={discounts} keyExtractor={(d) => d.id} loading={isLoading} />
      )}

      {activeTab === 'coupons' && (
        coupons.length === 0 ? <EmptyState icon={<Ticket className="w-8 h-8" />} title="No coupons" description="Generate coupon codes for promotions." action={<Button size="sm" onClick={() => setShowCouponModal(true)}>Create Coupon</Button>} />
        : <DataTable columns={couponColumns} data={coupons} keyExtractor={(c) => c.id} loading={isLoading} />
      )}

      <Modal isOpen={showDiscountModal} onClose={() => setShowDiscountModal(false)} title="New Discount" size="sm" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setShowDiscountModal(false)}>Cancel</Button><Button onClick={handleCreateDiscount}>Create</Button></div>}>
        <div className="space-y-4">
          <Input label="Discount Name" value={discName} onChange={(e) => setDiscName(e.target.value)} placeholder="e.g. Happy Hour 20%" />
          <Select label="Type" options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'flat', label: 'Flat Amount (₹)' }]} value={discType} onChange={(e) => setDiscType(e.target.value as 'flat' | 'percentage')} />
          <Input label={discType === 'flat' ? 'Amount (₹)' : 'Percentage'} type="number" value={discValue} onChange={(e) => setDiscValue(e.target.value)} placeholder={discType === 'flat' ? '100.00' : '20'} />
        </div>
      </Modal>

      <Modal isOpen={showCouponModal} onClose={() => setShowCouponModal(false)} title="New Coupon Code" size="sm" footer={<div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setShowCouponModal(false)}>Cancel</Button><Button onClick={handleCreateCoupon}>Create</Button></div>}>
        <div className="space-y-4">
          <Input label="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. WELCOME20" />
          <Select label="Linked Discount" options={discounts.map((d) => ({ value: d.id, label: d.name }))} value={couponDiscountId} onChange={(e) => setCouponDiscountId(e.target.value)} placeholder="Select discount" />
          <Input label="Max Uses" type="number" value={couponMaxUses} onChange={(e) => setCouponMaxUses(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}
