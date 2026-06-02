'use client'

import * as React from 'react'
import { 
  Building2, 
  Percent, 
  FileText, 
  Save, 
  CheckCircle2 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

export default function SettingsPage() {
  const [activeSubTab, setActiveSubTab] = React.useState<'profile' | 'taxes' | 'receipt'>('profile')
  const [isSaved, setIsSaved] = React.useState(false)

  // Form states
  const [cafeName, setCafeName] = React.useState('Brew & Bites Bistro')
  const [gstin, setGstin] = React.useState('27AAAAA1111A1Z1')
  const [cgst, setCgst] = React.useState('2.5')
  const [sgst, setSgst] = React.useState('2.5')
  const [receiptHeader, setReceiptHeader] = React.useState('Welcome to Brew & Bites!')
  const [receiptFooter, setReceiptFooter] = React.useState('Thank you! Visit again.')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <div className="w-full lg:w-64 flex flex-col gap-2">
        {[
          { id: 'profile', name: 'Store Profile', icon: Building2 },
          { id: 'taxes', name: 'Taxes & GST split', icon: Percent },
          { id: 'receipt', name: 'Receipt Settings', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeSubTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* 2. RIGHT COMPONENT FORM CONTENT */}
      <div className="flex-1">
        <form onSubmit={handleSave}>
          <Card>
            {activeSubTab === 'profile' && (
              <>
                <CardHeader>
                  <CardTitle className="text-slate-200">Store Profile</CardTitle>
                  <CardDescription className="text-slate-500">Configure your cafe branch's primary settings and details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    label="Cafe / Restaurant Name"
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Store Phone" defaultValue="+91 98765 43210" />
                    <Input label="Store Timezone" defaultValue="Asia/Kolkata" disabled />
                  </div>
                  <Input label="Address" defaultValue="102, Park Street, Bandra West, Mumbai" />
                </CardContent>
              </>
            )}

            {activeSubTab === 'taxes' && (
              <>
                <CardHeader>
                  <CardTitle className="text-slate-200">GST Compliance & Tax Split</CardTitle>
                  <CardDescription className="text-slate-500">Specify standard CGST, SGST, and service charge rates compliant with Indian laws</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    label="GSTIN (Goods and Services Tax Identification Number)"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input 
                      label="CGST Rate (%)"
                      type="number"
                      step="0.01"
                      value={cgst}
                      onChange={(e) => setCgst(e.target.value)}
                    />
                    <Input 
                      label="SGST Rate (%)"
                      type="number"
                      step="0.01"
                      value={sgst}
                      onChange={(e) => setSgst(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Service Charge Type" defaultValue="percent" disabled />
                    <Input label="Service Charge Value (%)" defaultValue="5.00" />
                  </div>
                </CardContent>
              </>
            )}

            {activeSubTab === 'receipt' && (
              <>
                <CardHeader>
                  <CardTitle className="text-slate-200">Receipt Design Template</CardTitle>
                  <CardDescription className="text-slate-500">Customize the print headers, footers, and compliance fields on thermal bills</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input 
                    label="Receipt Header Welcome Banner"
                    value={receiptHeader}
                    onChange={(e) => setReceiptHeader(e.target.value)}
                  />
                  <Input 
                    label="Receipt Footer Thank You Message"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                  />
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-900 font-mono text-[10px] text-slate-500 space-y-1 w-64 max-w-full mx-auto">
                    <div className="text-center font-bold text-slate-300">{cafeName.toUpperCase()}</div>
                    <div className="text-center text-[8px]">GSTIN: {gstin}</div>
                    <div className="border-t border-dashed border-slate-800 my-2" />
                    <div className="flex justify-between">
                      <span>Item Name</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="border-t border-dashed border-slate-800 my-2" />
                    <div className="text-center font-semibold text-slate-400">{receiptHeader}</div>
                    <div className="text-center text-[8px] text-slate-600">{receiptFooter}</div>
                  </div>
                </CardContent>
              </>
            )}

            {/* Bottom Actions footer */}
            <div className="border-t border-slate-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {isSaved && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Configuration saved successfully!</span>
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full sm:w-auto gap-2">
                <Save className="w-4 h-4 text-indigo-200" />
                <span>Save Config</span>
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
