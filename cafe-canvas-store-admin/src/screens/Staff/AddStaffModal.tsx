import { useState, useEffect } from 'react'
import { X, RefreshCw, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useTenantStore } from '../../store/tenant.store'

interface AddStaffModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function AddStaffModal({ onClose, onSuccess }: AddStaffModalProps) {
  const { tenantId } = useAuthStore()
  const { locations } = useTenantStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'manager' | 'cashier' | 'kitchen' | 'delivery' | 'staff'>('staff')
  const [locationId, setLocationId] = useState('')
  const [pin, setPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Generate random 4-digit PIN on mount
  useEffect(() => {
    generateRandomPin()
    // Select first location as default if available
    if (locations.length > 0) {
      setLocationId(locations[0].id)
    }
  }, [locations])

  const generateRandomPin = () => {
    const random = Math.floor(1000 + Math.random() * 9000).toString()
    setPin(random)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId) {
      setErrorMsg('No tenant ID found. Please log out and log in again.')
      return
    }

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full Name and Email are required.')
      return
    }

    if (pin.trim().length !== 4) {
      setErrorMsg('PIN must be exactly 4 digits.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      console.log('[AddStaff] Starting employee creation...', { tenantId, email: email.trim().toLowerCase(), role })

      // Check if email already exists in staff_accounts
      console.log('[AddStaff] Checking for duplicate email...')
      const { data: existing, error: checkError } = await supabase
        .from('staff_accounts')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (checkError) {
        console.error('[AddStaff] Duplicate check failed:', checkError)
        setErrorMsg('Failed to check for existing employee: ' + checkError.message)
        return
      }

      if (existing) {
        console.warn('[AddStaff] Duplicate email found:', existing.id)
        setErrorMsg('An employee with this email address already exists.')
        return
      }

      console.log('[AddStaff] No duplicate found. Inserting new staff record...')
      const insertPayload = {
        tenant_id: tenantId,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        role,
        pin: pin.trim() || null,
        location_id: locationId || null,
        is_active: true
      }
      console.log('[AddStaff] Insert payload:', insertPayload)

      const { data: insertedData, error: insertError } = await supabase
        .from('staff_accounts')
        .insert(insertPayload)
        .select('id, full_name, email')

      if (insertError) {
        console.error('[AddStaff] Insert failed:', insertError)
        // Provide user-friendly messages for common errors
        if (insertError.message.includes('duplicate key')) {
          setErrorMsg('An employee with this email already exists. Please refresh and try again.')
        } else if (insertError.message.includes('row-level security') || insertError.code === '42501') {
          setErrorMsg('Permission denied. Only managers and owners can add employees.')
        } else if (insertError.message.includes('staff_limit') || insertError.message.includes('50')) {
          setErrorMsg('Maximum staff limit (50) reached for this tenant.')
        } else {
          setErrorMsg(insertError.message)
        }
      } else {
        console.log('[AddStaff] Insert successful:', insertedData)
        onSuccess()
      }
    } catch (err: any) {
      console.error('[AddStaff] Unexpected error:', err)
      setErrorMsg(err.message || 'An unexpected error occurred while adding staff.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] font-body select-none">
      <div className="relative w-full max-w-[480px] bg-canvas-cream border border-canvas-border rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-canvas-surface border-b border-canvas-border">
          <h3 className="font-display text-lg font-bold text-canvas-brown">
            Add New Employee
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-canvas-brown_light hover:bg-canvas-cream hover:text-canvas-brown transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-canvas-coral/15 border border-canvas-coral/25 rounded-lg flex items-start gap-2.5 text-xs text-canvas-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-bold">{errorMsg}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Yash Zagde"
              className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. yash@aether-cafe.com"
                className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none transition-all placeholder-canvas-brown_light"
              />
            </div>
          </div>

          {/* Role & Location selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                Assign Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
              >
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
                <option value="kitchen">Kitchen Display</option>
                <option value="delivery">Delivery</option>
                <option value="staff">Staff/Waiter</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                Assign Location
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
              >
                {locations.length === 0 ? (
                  <option value="">Main Branch</option>
                ) : (
                  locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* POS Access PIN */}
          <div className="space-y-1 bg-canvas-surface/40 p-4 rounded-xl border border-canvas-border/45">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-canvas-brown uppercase tracking-wider">
                POS Access PIN
              </label>
              <button
                type="button"
                onClick={generateRandomPin}
                className="text-[10px] font-bold text-canvas-terracotta hover:text-canvas-terra_light flex items-center gap-1 focus:outline-none"
              >
                <RefreshCw className="w-3 h-3" />
                Generate PIN
              </button>
            </div>
            <input
              type="text"
              maxLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="e.g. 1045"
              className="w-full text-center px-4 py-2.5 rounded-lg border border-canvas-border bg-white text-sm font-bold tracking-widest text-canvas-terracotta focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 outline-none"
            />
            <p className="text-[9px] text-canvas-brown_light font-semibold mt-1">
              This 4-digit code is required for POS sign-ins on tablet and mobile waiter devices.
            </p>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-canvas-border/50">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg bg-white border border-canvas-border hover:bg-canvas-cream text-canvas-brown_mid font-bold text-xs shadow-sm transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light active:bg-canvas-terra_dark text-white font-bold text-xs shadow-md shadow-canvas-terracotta/10 transition-colors focus:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
