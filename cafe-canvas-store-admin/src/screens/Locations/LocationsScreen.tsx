import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Phone, Users, Ban, Trash2, ShieldCheck, X } from 'lucide-react'
import { useTenantStore } from '../../store/tenant.store'
import { useAuthStore } from '../../store/auth.store'
import { supabase } from '../../lib/supabase'

interface LocationStaffCounts {
  [locationId: string]: number
}

export function LocationsScreen() {
  const { tenantId } = useAuthStore()
  const { locations, addLocation, updateLocation, deleteLocation } = useTenantStore()

  const [staffCounts, setStaffCounts] = useState<LocationStaffCounts>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form states
  const [locName, setLocName] = useState('')
  const [locAddress, setLocAddress] = useState('')
  const [locCity, setLocCity] = useState('')
  const [locState, setLocState] = useState('')
  const [locPincode, setLocPincode] = useState('')
  const [locPhone, setLocPhone] = useState('')

  // Fetch staff counts per branch
  const fetchCounts = async () => {
    if (!tenantId || locations.length === 0) return
    try {
      const counts: LocationStaffCounts = {}
      for (const loc of locations) {
        const { count, error } = await supabase
          .from('staff_accounts')
          .select('*', { count: 'exact', head: true })
          .eq('location_id', loc.id)

        if (!error && count !== null) {
          counts[loc.id] = count
        } else {
          counts[loc.id] = 0
        }
      }
      setStaffCounts(counts)
    } catch (err) {
      console.error('Failed to resolve staff counts:', err)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [locations, tenantId])

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await updateLocation(id, { is_active: !currentStatus })
    if (res.error) {
      alert('Failed to update branch status: ' + res.error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this branch location? All linked records will be updated.')) {
      const res = await deleteLocation(id)
      if (res.error) {
        alert('Failed to remove location: ' + res.error)
      }
    }
  }

  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!locName.trim()) {
      setErrorMsg('Branch Name is required.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    const res = await addLocation({
      name: locName.trim(),
      address: locAddress.trim() || null,
      city: locCity.trim() || null,
      state: locState.trim() || null,
      pincode: locPincode.trim() || null,
      phone: locPhone.trim() || null,
    })

    setIsSubmitting(false)
    if (res.error) {
      setErrorMsg(res.error)
    } else {
      // Clear forms
      setLocName('')
      setLocAddress('')
      setLocCity('')
      setLocState('')
      setLocPincode('')
      setLocPhone('')
      setIsModalOpen(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-6 select-none">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-canvas-brown">Store Locations</h2>
          <p className="text-sm text-canvas-brown_mid font-medium mt-1">
            Configure restaurant branches, operating details, contact info, and metrics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light active:bg-canvas-terra_dark text-white font-bold text-sm shadow-md shadow-canvas-terracotta/10 transition-colors focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Locations Card Grid */}
      {locations.length === 0 ? (
        <div className="bg-canvas-surface border border-canvas-border p-20 rounded-xl text-center flex flex-col items-center justify-center text-canvas-brown_light shadow-sm">
          <MapPin className="w-12 h-12 mb-3 text-canvas-border" />
          <h4 className="text-sm font-bold text-canvas-brown">No Branch Locations Available</h4>
          <p className="text-xs mt-1">Click the button above to add your first store location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => {
            const count = staffCounts[loc.id] || 0
            return (
              <div 
                key={loc.id} 
                className="bg-canvas-surface rounded-xl border border-canvas-border p-5 shadow-sm hover:border-canvas-terracotta hover:shadow-md transition-all flex flex-col justify-between h-56"
              >
                {/* Branch Info Header */}
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-xl font-bold text-canvas-brown truncate max-w-[170px]">
                      {loc.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${
                      loc.is_active 
                        ? 'bg-canvas-sage/10 text-canvas-sage border-canvas-sage/35' 
                        : 'bg-canvas-coral/15 text-canvas-error border-canvas-coral/30'
                    }`}>
                      {loc.is_active ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  
                  {/* Address info */}
                  <div className="text-xs font-semibold text-canvas-brown_mid mt-3 space-y-1 pr-4">
                    <p className="truncate flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-canvas-gold mt-0.5" />
                      <span>
                        {loc.address ? `${loc.address}, ` : ''}{loc.city || ''}
                      </span>
                    </p>
                    {loc.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-canvas-gold shrink-0" />
                        <span>{loc.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Branch Footer & Details */}
                <div className="border-t border-canvas-border/50 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-canvas-brown">
                    <Users className="w-4 h-4 text-canvas-terracotta" />
                    <span className="text-xs font-bold">{count} Staff Linked</span>
                  </div>

                  {/* Actions: toggle status / delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(loc.id, loc.is_active)}
                      className={`p-1.5 rounded hover:bg-white border border-transparent hover:border-canvas-border shadow-sm transition-colors text-canvas-brown_mid ${
                        loc.is_active ? 'hover:text-canvas-error' : 'hover:text-canvas-sage'
                      }`}
                      title={loc.is_active ? 'Mark Branch as Inactive' : 'Mark Branch as Active'}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="p-1.5 rounded hover:bg-white text-canvas-brown_mid hover:text-canvas-error border border-transparent hover:border-canvas-border shadow-sm transition-colors"
                      title="Remove Location"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Location Overlay Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] font-body select-none">
          <div className="relative w-full max-w-[480px] bg-canvas-cream border border-canvas-border rounded-xl shadow-lg overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-canvas-surface border-b border-canvas-border">
              <h3 className="font-display text-lg font-bold text-canvas-brown">
                Add Location Branch
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-canvas-brown_light hover:bg-canvas-cream hover:text-canvas-brown transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddLocationSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-canvas-coral/15 border border-canvas-coral/25 rounded-lg flex items-start gap-2.5 text-xs text-canvas-error animate-shake">
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-bold">{errorMsg}</span>
                </div>
              )}

              {/* Branch Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                  Branch Name
                </label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Koregaon Park Branch"
                  className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                  Street Address
                </label>
                <input
                  type="text"
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  placeholder="e.g. Shop 12, Gold Field Plaza"
                  className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                    City
                  </label>
                  <input
                    type="text"
                    value={locCity}
                    onChange={(e) => setLocCity(e.target.value)}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                    State
                  </label>
                  <input
                    type="text"
                    value={locState}
                    onChange={(e) => setLocState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
                  />
                </div>
              </div>

              {/* Pincode & Contact Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={locPincode}
                    onChange={(e) => setLocPincode(e.target.value)}
                    placeholder="e.g. 411001"
                    className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                    Branch Phone
                  </label>
                  <input
                    type="text"
                    value={locPhone}
                    onChange={(e) => setLocPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-canvas-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-lg bg-white border border-canvas-border hover:bg-canvas-cream text-canvas-brown_mid font-bold text-xs shadow-sm transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light active:bg-canvas-terra_dark text-white font-bold text-xs shadow-md shadow-canvas-terracotta/10 transition-colors focus:outline-none disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
