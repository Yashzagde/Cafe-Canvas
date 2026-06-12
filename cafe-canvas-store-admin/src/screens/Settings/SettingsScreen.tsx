import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Clock, 
  Percent, 
  CreditCard, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle,
  Sparkles,
  Save,
  Printer
} from 'lucide-react'
import { useTenantStore } from '../../store/tenant.store'
import { supabase } from '../../lib/supabase'

type TabType = 'general' | 'hours' | 'tax' | 'payments' | 'subscription' | 'account' | 'receipt'

export function SettingsScreen() {
  const { tenant, settings, updateSettings, fetchTenantData } = useTenantStore()

  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // General tab states
  const [storeName, setStoreName] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [storeCity, setStoreCity] = useState('')
  const [storeState, setStoreState] = useState('')
  const [storePincode, setStorePincode] = useState('')

  // Tax tab states
  const [cgst, setCgst] = useState(9)
  const [sgst, setSgst] = useState(9)
  const [taxInclusive, setTaxInclusive] = useState(false)

  // Payments tab states
  const [razorpayKey, setRazorpayKey] = useState('')
  const [upiId, setUpiId] = useState('')



  // Hours tab states
  const [openTime, setOpenTime] = useState('09:00')
  const [closeTime, setCloseTime] = useState('22:00')

  // Receipt tab states
  const [receiptHeader, setReceiptHeader] = useState('')
  const [receiptFooter, setReceiptFooter] = useState('')
  const [printerWidth, setPrinterWidth] = useState('80mm')
  const [autoPrint, setAutoPrint] = useState(false)

  // Sync state values when store data is loaded
  useEffect(() => {
    if (tenant) {
      setStoreName(tenant.name || '')
      setStorePhone(tenant.phone || '')
      setStoreAddress(tenant.address || '')
      setStoreCity(tenant.city || '')
      setStoreState(tenant.state || '')
      setStorePincode(tenant.pincode || '')
    }
    if (settings) {
      setCgst(Number(settings.tax_cgst) || 9)
      setSgst(Number(settings.tax_sgst) || 9)
      setTaxInclusive(settings.tax_inclusive || false)
      setRazorpayKey(settings.razorpay_key_id || '')
      setUpiId(settings.upi_id || '')
      setOpenTime(settings.open_time?.slice(0, 5) || '09:00')
      setCloseTime(settings.close_time?.slice(0, 5) || '22:00')
      setReceiptHeader(settings.receipt_header || '')
      setReceiptFooter(settings.receipt_footer || 'Thank you! Visit again.')
    }
  }, [tenant, settings])

  // Load local client settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWidth = localStorage.getItem('pos_printer_width')
      const storedAutoPrint = localStorage.getItem('pos_auto_print')
      if (storedWidth) setPrinterWidth(storedWidth)
      if (storedAutoPrint) setAutoPrint(storedAutoPrint === 'true')
    }
  }, [])

  const showFeedback = (success: boolean, msg: string) => {
    if (success) {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(null), 3000)
    } else {
      setErrorMsg(msg)
      setTimeout(() => setErrorMsg(null), 4000)
    }
  }

  // Handle updates for General tab (updates 'tenants' table)
  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          name: storeName,
          phone: storePhone,
          address: storeAddress,
          city: storeCity,
          state: storeState,
          pincode: storePincode
        })
        .eq('id', tenant.id)

      if (error) {
        showFeedback(false, 'Failed to update store details: ' + error.message)
      } else {
        await fetchTenantData(tenant.id)
        showFeedback(true, 'General store details successfully saved.')
      }
    } catch (err: any) {
      showFeedback(false, err.message || 'An error occurred during save.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle updates for other tabs (updates 'store_settings' table)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    let updates = {}
    if (activeTab === 'tax') {
      updates = { tax_cgst: cgst, tax_sgst: sgst, tax_inclusive: taxInclusive }
    } else if (activeTab === 'payments') {
      updates = { razorpay_key_id: razorpayKey, upi_id: upiId }
    } else if (activeTab === 'hours') {
      updates = { open_time: openTime, close_time: closeTime }
    } else if (activeTab === 'receipt') {
      updates = { receipt_header: receiptHeader, receipt_footer: receiptFooter }
      if (typeof window !== 'undefined') {
        localStorage.setItem('pos_printer_width', printerWidth)
        localStorage.setItem('pos_auto_print', String(autoPrint))
      }
    }


    const res = await updateSettings(updates)
    setIsSaving(false)
    if (res.error) {
      showFeedback(false, 'Failed to update settings: ' + res.error)
    } else {
      showFeedback(true, 'Configuration preferences successfully updated.')
    }
  }

  const handleOpenBilling = () => {
    window.electronAPI.openExternal('https://cafecanvas.bar/pricing')
  }

  const tabsConfig = [
    { id: 'general' as TabType, label: 'General Details', icon: Settings },
    { id: 'hours' as TabType, label: 'Operating Hours', icon: Clock },
    { id: 'tax' as TabType, label: 'Taxation Rules', icon: Percent },
    { id: 'payments' as TabType, label: 'Payment Gateway', icon: CreditCard },
    { id: 'receipt' as TabType, label: 'Receipt & Printer', icon: Printer },
    { id: 'subscription' as TabType, label: 'Merchant Plan', icon: Sparkles },
    { id: 'account' as TabType, label: 'System Access', icon: ShieldCheck },
  ]

  return (
    <div className="flex h-full gap-6 select-none font-body">
      
      {/* Left Pane: Tab Selection List */}
      <div className="w-1/4 bg-canvas-surface p-4 rounded-xl border border-canvas-border shadow-sm flex flex-col gap-1.5 h-fit">
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-canvas-brown_mid px-3 mb-2">
          Store Settings
        </h3>
        {tabsConfig.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setErrorMsg(null)
                setSuccessMsg(null)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all duration-150 ${
                isActive 
                  ? 'bg-canvas-terracotta text-white shadow-sm shadow-canvas-terra_dark/15' 
                  : 'text-canvas-brown hover:bg-canvas-cream/50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Right Pane: Configuration Content */}
      <div className="flex-1 bg-canvas-surface p-6 rounded-xl border border-canvas-border shadow-sm overflow-y-auto flex flex-col justify-between min-h-[460px]">
        <div>
          {/* Success / Error Alerts */}
          {successMsg && (
            <div className="mb-4 p-3 bg-canvas-sage/10 border border-canvas-sage/35 rounded-lg text-xs text-canvas-sage font-bold">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 bg-canvas-coral/15 border border-canvas-coral/25 rounded-lg text-xs text-canvas-error font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {/* TAB 1: GENERAL DETAILS */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-bold text-canvas-brown">General Details</h4>
                <p className="text-xs text-canvas-brown_mid font-medium">Define your store name and geographic credentials.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Store Name</label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Store Phone</label>
                  <input
                    type="text"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      value={storeCity}
                      onChange={(e) => setStoreCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">State</label>
                    <input
                      type="text"
                      value={storeState}
                      onChange={(e) => setStoreState(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Pincode</label>
                    <input
                      type="text"
                      value={storePincode}
                      onChange={(e) => setStorePincode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light text-white font-bold text-xs transition-colors shadow-md shadow-canvas-terracotta/10 focus:outline-none disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save General Details'}
              </button>
            </form>
          )}

          {/* TAB 2: OPERATING HOURS */}
          {activeTab === 'hours' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-bold text-canvas-brown">Operating Hours</h4>
                <p className="text-xs text-canvas-brown_mid font-medium">Define opening and closing profiles for order triggers.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Open Time</label>
                  <input
                    type="time"
                    required
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-canvas-border bg-white text-xs font-bold text-canvas-brown outline-none focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Close Time</label>
                  <input
                    type="time"
                    required
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-canvas-border bg-white text-xs font-bold text-canvas-brown outline-none focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light text-white font-bold text-xs transition-colors shadow-md shadow-canvas-terracotta/10 focus:outline-none disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Updating...' : 'Save Operating Hours'}
              </button>
            </form>
          )}

          {/* TAB 3: TAXATION RULES */}
          {activeTab === 'tax' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-bold text-canvas-brown">Taxation Rules</h4>
                <p className="text-xs text-canvas-brown_mid font-medium">Configure Indian GST settings for billing calculations (in INR).</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">CGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={cgst}
                      onChange={(e) => setCgst(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">SGST Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sgst}
                      onChange={(e) => setSgst(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-canvas-cream/50 p-4 rounded-xl border border-canvas-border/45">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taxInclusive}
                      onChange={(e) => setTaxInclusive(e.target.checked)}
                      className="rounded border-canvas-border text-canvas-terracotta focus:ring-canvas-terracotta/30 w-4 h-4"
                    />
                    <div>
                      <p className="text-xs font-bold text-canvas-brown">Tax Inclusive Pricing</p>
                      <p className="text-[10px] text-canvas-brown_light font-medium mt-0.5">
                        If checked, catalog menu prices include GST splits. If unchecked, GST is added during checkout.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light text-white font-bold text-xs transition-colors shadow-md shadow-canvas-terracotta/10 focus:outline-none disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save Taxation Rules'}
              </button>
            </form>
          )}

          {/* TAB 4: PAYMENT GATEWAY */}
          {activeTab === 'payments' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-bold text-canvas-brown">Payment Settings</h4>
                <p className="text-xs text-canvas-brown_mid font-medium">Verify API credentials for Razorpay and UPI order routing.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Razorpay Key ID</label>
                  <input
                    type="text"
                    value={razorpayKey}
                    onChange={(e) => setRazorpayKey(e.target.value)}
                    placeholder="rzp_test_..."
                    className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Store UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. businessname@okhdfcbank"
                    className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light text-white font-bold text-xs transition-colors shadow-md shadow-canvas-terracotta/10 focus:outline-none disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Updating...' : 'Save Payment Keys'}
              </button>
            </form>
          )}

          {/* TAB 4.5: RECEIPT & PRINTER SETTINGS */}
          {activeTab === 'receipt' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-bold text-canvas-brown">Receipt & Printer Settings</h4>
                <p className="text-xs text-canvas-brown_mid font-medium">Configure layout options for physical thermal receipts and POS hardware.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Receipt Header Text</label>
                  <textarea
                    rows={3}
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                    placeholder="e.g. Aether Café&#10;123 Coffee Lane, New Delhi"
                    className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none resize-none"
                  />
                  <p className="text-[9px] text-canvas-brown_light">Prints at the top of every invoice billing ticket.</p>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Receipt Footer Text</label>
                  <textarea
                    rows={2}
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                    placeholder="Thank you! Visit again."
                    className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">Thermal Printer Width</label>
                    <select
                      value={printerWidth}
                      onChange={(e) => setPrinterWidth(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none cursor-pointer"
                    >
                      <option value="80mm">80mm (Standard Desktop Thermal)</option>
                      <option value="58mm">58mm (Mobile/Handheld POS)</option>
                    </select>
                    <p className="text-[9px] text-canvas-brown_light">Local workstation setting stored on this client.</p>
                  </div>

                  <div className="bg-canvas-cream/50 p-4 rounded-xl border border-canvas-border/45 flex items-center h-fit self-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPrint}
                        onChange={(e) => setAutoPrint(e.target.checked)}
                        className="rounded border-canvas-border text-canvas-terracotta focus:ring-canvas-terracotta/30 w-4 h-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-canvas-brown">Auto-Print Order Bills</p>
                        <p className="text-[9px] text-canvas-brown_light font-medium mt-0.5">
                          Instantly prints orders to thermal printer on confirmation.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light text-white font-bold text-xs transition-colors shadow-md shadow-canvas-terracotta/10 focus:outline-none disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Updating...' : 'Save Receipt Settings'}
              </button>
            </form>
          )}

          {/* TAB 5: MERCHANT PLAN */}
          {activeTab === 'subscription' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-display text-xl font-bold text-canvas-brown">Subscription & Billing</h4>
                <p className="text-xs text-canvas-brown_mid font-medium">Verify platform tiers and license variables.</p>
              </div>

              <div className="bg-canvas-cream/50 p-5 rounded-xl border border-canvas-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-canvas-brown_mid tracking-wider">Current Tier Plan</p>
                  <p className="font-display text-2xl font-bold text-canvas-terracotta mt-1 capitalize">
                    {tenant?.subscription_tier || 'Pro'} License
                  </p>
                  <p className="text-xs font-semibold text-canvas-brown_light mt-1">
                    Next cycle renewal: July 2026
                  </p>
                </div>
                <button
                  onClick={handleOpenBilling}
                  className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-canvas-gold hover:bg-canvas-gold_light text-canvas-brown font-bold text-xs transition-colors shadow-sm focus:outline-none self-start sm:self-center"
                >
                  Change Plan
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-border/50 text-xs font-semibold text-canvas-brown_mid leading-relaxed">
                🚀 Upgrade to the <strong className="text-canvas-terracotta">Growth</strong> or <strong className="text-canvas-terracotta">Enterprise</strong> plan to unlock multi-branch stock synchronizers, daily SMS blasts via MSG91, advanced charts, and detailed analytics exports.
              </div>
            </div>
          )}

          {/* TAB 6: ACCOUNT SECURITY */}
          {activeTab === 'account' && (
            <div className="space-y-6 font-body">
              <div>
                <h4 className="font-display text-xl font-bold text-canvas-brown">Access Control</h4>
                <p className="text-xs text-canvas-brown_mid font-medium">Manage master password credentials and system boundaries.</p>
              </div>

              {/* Password Section */}
              <div className="space-y-3">
                <button
                  onClick={() => window.electronAPI.openExternal('https://cafecanvas.bar/forgot-password')}
                  className="py-2.5 px-4 rounded-lg bg-white border border-canvas-border hover:bg-canvas-cream text-canvas-brown_mid font-bold text-xs shadow-sm transition-colors focus:outline-none"
                >
                  Trigger Master Password Reset
                </button>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5 space-y-3">
                <h5 className="text-xs font-extrabold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h5>
                <p className="text-[11px] font-semibold text-canvas-brown_mid leading-relaxed">
                  Deactivating this tenant deletes restaurant assets, billing, menus, locations, and terminates all cashier table codes. This action is irreversible.
                </p>
                <button
                  onClick={() => {
                    const confirmInput = prompt('Type DEACTIVATE to delete Aether Café permanently:')
                    if (confirmInput === 'DEACTIVATE') {
                      alert('Merchant account deactivation queue triggered. System admin will process.')
                    }
                  }}
                  className="py-2 px-3 rounded bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors focus:outline-none"
                >
                  Deactivate Café
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
