import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, ShieldAlert, Key, Ban, UserCheck, Download, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useTenantStore } from '../../store/tenant.store'
import { AddStaffModal } from './AddStaffModal'
import type { StaffAccount } from '../../lib/types'

export function StaffScreen() {
  const { tenantId } = useAuthStore()
  const { locations } = useTenantStore()
  
  const [staffList, setStaffList] = useState<StaffAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'manager' | 'cashier' | 'kitchen' | 'delivery' | 'staff'>('all')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fetch staff accounts on mount and when tenant changes
  const fetchStaff = async () => {
    if (!tenantId) return
    setIsLoading(true)
    setErrorMsg(null)
    try {
      const { data, error } = await supabase
        .from('staff_accounts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('full_name', { ascending: true })

      if (error) {
        setErrorMsg('Failed to fetch staff accounts: ' + error.message)
      } else {
        setStaffList(data || [])
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred fetching staff data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [tenantId])

  // Toggle user active status
  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('staff_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) {
        alert('Failed to update status: ' + error.message)
      } else {
        setStaffList(prev => prev.map(staff => staff.id === id ? { ...staff, is_active: !currentStatus } : staff))
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update status.')
    }
  }

  // Reset PIN trigger
  const handleResetPin = async (id: string) => {
    const newPin = Math.floor(1000 + Math.random() * 9000).toString()
    try {
      const { error } = await supabase
        .from('staff_accounts')
        .update({ pin: newPin })
        .eq('id', id)

      if (error) {
        alert('Failed to reset PIN: ' + error.message)
      } else {
        alert(`PIN successfully reset. New PIN for this employee is: ${newPin}`)
        setStaffList(prev => prev.map(staff => staff.id === id ? { ...staff, pin: newPin } : staff))
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset PIN.')
    }
  }

  // Filtered list computed client side
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (staff.phone && staff.phone.includes(searchTerm))

    const matchesRole = selectedRoleFilter === 'all' || staff.role === selectedRoleFilter
    const matchesLocation = selectedLocationFilter === 'all' || staff.location_id === selectedLocationFilter

    return matchesSearch && matchesRole && matchesLocation
  })

  // Role Badge Styling classes
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-canvas-gold/15 text-canvas-brown border-canvas-gold/45'
      case 'cashier':
        return 'bg-canvas-teal/15 text-canvas-brown border-canvas-teal/45'
      case 'kitchen':
        return 'bg-canvas-coral/15 text-canvas-brown border-canvas-coral/45'
      case 'delivery':
        return 'bg-canvas-terracotta/15 text-canvas-brown border-canvas-terracotta/45'
      default:
        return 'bg-canvas-surface text-canvas-brown_mid border-canvas-border'
    }
  }

  // Export filtered list to CSV
  const handleExportCSV = () => {
    if (filteredStaff.length === 0) return
    const headers = ['Full Name', 'Email', 'Phone', 'Role', 'PIN', 'Active']
    const rows = filteredStaff.map(staff => [
      staff.full_name,
      staff.email,
      staff.phone || '',
      staff.role,
      staff.pin || '',
      staff.is_active ? 'Yes' : 'No'
    ])
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    
    const encodedUri = encodeURI(csvContent)
    window.electronAPI.openExternal(encodedUri)
  }

  return (
    <div className="flex flex-col h-full space-y-6 select-none">
      {/* Header and Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold text-canvas-brown">Staff Directory</h2>
          <p className="text-sm text-canvas-brown_mid font-medium mt-1">
            Manage permissions, PIN codes, branch locations, and system access.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 py-2.5 px-4 rounded-lg bg-canvas-terracotta hover:bg-canvas-terra_light active:bg-canvas-terra_dark text-white font-bold text-sm shadow-md shadow-canvas-terracotta/10 transition-colors focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-canvas-surface p-4 rounded-xl border border-canvas-border space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-canvas-brown_light" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown outline-none focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20 transition-all placeholder-canvas-brown_light"
            />
          </div>

          {/* Controls: Branch Filter + Export */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-canvas-brown_mid" />
              <select
                value={selectedLocationFilter}
                onChange={(e) => setSelectedLocationFilter(e.target.value)}
                className="py-2.5 px-3 rounded-lg border border-canvas-border bg-white text-xs font-semibold text-canvas-brown outline-none focus:border-canvas-terracotta focus:ring-1 focus:ring-canvas-terracotta/20"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={filteredStaff.length === 0}
              className="flex items-center gap-1.5 py-2.5 px-3.5 rounded-lg bg-white border border-canvas-border hover:bg-canvas-cream text-canvas-brown_mid font-bold text-xs shadow-sm transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabs: Role Filter */}
        <div className="flex flex-wrap gap-1 border-t border-canvas-border/50 pt-3">
          {(['all', 'manager', 'cashier', 'kitchen', 'delivery', 'staff'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                selectedRoleFilter === role
                  ? 'bg-canvas-terracotta text-white shadow-sm shadow-canvas-terra_dark/10'
                  : 'bg-white/50 text-canvas-brown_mid hover:bg-white hover:text-canvas-brown border border-canvas-border/30'
              }`}
            >
              {role === 'all' ? 'All Roles' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Screen */}
      <div className="flex-1 bg-canvas-surface rounded-xl border border-canvas-border shadow-sm overflow-hidden flex flex-col justify-between">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 flex-grow">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-canvas-champagne border-t-canvas-terracotta"></div>
            <p className="mt-3 text-xs font-bold text-canvas-brown_mid">Fetching staff accounts...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center p-20 text-center flex-grow">
            <ShieldAlert className="w-10 h-10 text-canvas-coral mb-2" />
            <p className="text-xs font-bold text-canvas-error">{errorMsg}</p>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center p-20 flex-grow flex flex-col items-center justify-center text-canvas-brown_light">
            <Users className="w-12 h-12 mb-3 text-canvas-border" />
            <h4 className="text-sm font-bold text-canvas-brown">No Staff Records Found</h4>
            <p className="text-xs mt-1">Try modifying your query terms or filter states.</p>
          </div>
        ) : (
          <div className="overflow-auto flex-grow max-h-[500px]">
            <table className="w-full text-left text-xs font-semibold text-canvas-brown border-collapse">
              <thead>
                <tr className="border-b border-canvas-border text-canvas-brown_mid bg-canvas-cream/50 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role Badge</th>
                  <th className="py-3 px-4">Branch Location</th>
                  <th className="py-3 px-4">POS Access PIN</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border/50">
                {filteredStaff.map((staff) => {
                  const resolvedLocation = locations.find(l => l.id === staff.location_id)?.name || 'Main Branch'
                  return (
                    <tr key={staff.id} className="hover:bg-canvas-cream/35 transition-colors">
                      {/* Name & Initials */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center border text-[11px] uppercase ${
                            staff.is_active ? 'bg-canvas-brown text-canvas-cream border-canvas-brown/10' : 'bg-canvas-border text-canvas-brown_mid border-canvas-border/30'
                          }`}>
                            {staff.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className={`font-bold ${staff.is_active ? 'text-canvas-brown' : 'text-canvas-brown_light line-through'}`}>
                              {staff.full_name}
                            </p>
                            <p className="text-[10px] text-canvas-brown_light">{staff.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-canvas-brown_mid select-text">{staff.email}</td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getRoleBadgeStyle(staff.role)}`}>
                          {staff.role}
                        </span>
                      </td>

                      {/* Branch Name */}
                      <td className="py-3.5 px-4 text-canvas-brown_mid font-bold">{resolvedLocation}</td>

                      {/* POS PIN */}
                      <td className="py-3.5 px-4 font-mono font-bold tracking-widest text-canvas-terracotta">
                        {staff.pin || '----'}
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleActiveStatus(staff.id, staff.is_active)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            staff.is_active
                              ? 'bg-canvas-sage/10 text-canvas-sage border-canvas-sage/30 hover:bg-canvas-coral/10 hover:text-canvas-coral hover:border-canvas-coral/30'
                              : 'bg-canvas-coral/10 text-canvas-error border-canvas-coral/30 hover:bg-canvas-sage/10 hover:text-canvas-sage hover:border-canvas-sage/30'
                          } transition-all`}
                        >
                          {staff.is_active ? (
                            <>
                              <UserCheck className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3" />
                              Suspended
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions Reset / Deactivate */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResetPin(staff.id)}
                            className="p-1.5 rounded hover:bg-white text-canvas-brown_mid hover:text-canvas-gold border border-transparent hover:border-canvas-border shadow-sm transition-colors"
                            title="Reset POS PIN"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Overlay Insert Modal */}
      {isAddModalOpen && (
        <AddStaffModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false)
            fetchStaff()
          }} 
        />
      )}
    </div>
  )
}
