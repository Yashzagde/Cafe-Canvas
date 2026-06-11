import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { toast } from '../components/ui/Toast'

export interface StaffCall {
  id: string
  tenant_id: string
  table_id: string
  table_number: number
  location_id?: string
  called_at: string
  attended_at?: string
  attended_by?: string
  status: 'pending' | 'resolved' | 'ignored'
  tableName?: string
  escalated?: boolean
}

export interface StaffMember {
  id: string
  name: string
  role: string
  is_active: boolean
}

interface StaffCallsState {
  calls: StaffCall[]
  availableStaff: StaffMember[]
  escalatedCall: StaffCall | null
  isLoading: boolean
  
  fetchActiveCalls: (tenantId: string) => Promise<void>
  fetchAvailableStaff: (tenantId: string) => Promise<void>
  subscribeToStaffCalls: (publicId: string, tenantId: string, privateId: string) => () => void
  forwardCall: (callId: string, staffId: string, privateId: string) => Promise<void>
  clearEscalation: () => void
}

const timers: Record<string, NodeJS.Timeout> = {}

export const useStaffCallsStore = create<StaffCallsState>((set, get) => ({
  calls: [],
  availableStaff: [],
  escalatedCall: null,
  isLoading: false,

  fetchActiveCalls: async (tenantId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('staff_calls')
        .select(`
          *,
          tables:table_id (name)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted: StaffCall[] = (data || []).map((c: any) => ({
        id: c.id,
        tenant_id: c.tenant_id,
        table_id: c.table_id,
        table_number: c.table_number,
        location_id: c.location_id,
        called_at: c.called_at || c.created_at,
        status: c.status,
        tableName: c.tables?.name || `Table ${c.table_number}`,
        escalated: false
      }))

      set({ calls: formatted })
    } catch (err) {
      console.error('Failed to fetch active staff calls:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAvailableStaff: async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('staff_accounts')
        .select('id, name, role, is_active')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)

      if (error) throw error
      set({ availableStaff: data || [] })
    } catch (err) {
      console.error('Failed to fetch staff members:', err)
    }
  },

  subscribeToStaffCalls: (publicId, tenantId, privateId) => {
    // 1. Subscribe to Public Broadcast Channel from storefront
    const publicChannel = supabase
      .channel(`public-calls:${publicId}`, {
        config: { broadcast: { self: false } }
      })
      .on('broadcast', { event: 'staff_call' }, async ({ payload }) => {
        console.log('Received public staff call broadcast:', payload)
        
        try {
          // Register the call in database
          const { data: newCall, error } = await supabase
            .from('staff_calls')
            .insert({
              tenant_id: tenantId,
              table_id: payload.tableId,
              table_number: parseInt(payload.tableName.replace(/\D/g, '')) || 0,
              location_id: payload.locationId,
              status: 'pending'
            })
            .select(`
              *,
              tables:table_id (name)
            `)
            .single()

          if (error) throw error

          const callObj: StaffCall = {
            id: newCall.id,
            tenant_id: newCall.tenant_id,
            table_id: newCall.table_id,
            table_number: newCall.table_number,
            location_id: newCall.location_id,
            called_at: newCall.called_at || newCall.created_at,
            status: newCall.status,
            tableName: payload.tableName || newCall.tables?.name || `Table ${newCall.table_number}`,
            escalated: false
          }

          set(state => ({ calls: [callObj, ...state.calls] }))
          toast.info('Ding Dong!', `Staff assistance requested at ${callObj.tableName}`)

          // 2. Relay to all staff via Private Broadcast Channel
          const privateChannelName = callObj.location_id
            ? `private-calls:${privateId}:${callObj.location_id}`
            : `private-calls:${privateId}`
          const privateChannel = supabase.channel(privateChannelName)
          privateChannel.send({
            type: 'broadcast',
            event: 'staff_call_relay',
            payload: {
              id: callObj.id,
              tableId: callObj.table_id,
              tableName: callObj.tableName,
              locationId: callObj.location_id,
              calledAt: callObj.called_at
            }
          })

          // 3. Start 1-minute (60 seconds) escalation timer
          const timerId = setTimeout(() => {
            const currentCalls = get().calls
            const match = currentCalls.find(c => c.id === callObj.id && c.status === 'pending')
            if (match) {
              // Escalated! Update state
              set(state => {
                const updated = state.calls.map(c => c.id === callObj.id ? { ...c, escalated: true } : c)
                return {
                  calls: updated,
                  escalatedCall: { ...callObj, escalated: true }
                }
              })
              toast.error('Escalation Alert!', `${callObj.tableName} staff call has not been taken for 1 minute!`)
            }
          }, 60000)

          timers[callObj.id] = timerId

        } catch (dbErr) {
          console.error('Failed to register staff call in DB:', dbErr)
        }
      })
      .subscribe()

    // 4. Subscribe to database updates on staff_calls (watch for staff accepts)
    const dbChannel = supabase
      .channel(`db-staff-calls:${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_calls',
          filter: `tenant_id=eq.${tenantId}`
        },
        (payload) => {
          console.log('Received staff_calls DB change:', payload)
          if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            const updatedCall = payload.new as any
            
            // Clear timer if no longer pending
            if (updatedCall.status !== 'pending' && timers[updatedCall.id]) {
              clearTimeout(timers[updatedCall.id])
              delete timers[updatedCall.id]
            }

            // Update list
            if (updatedCall.status === 'pending') {
              set(state => ({
                calls: state.calls.map(c => c.id === updatedCall.id ? { ...c, status: updatedCall.status } : c)
              }))
            } else {
              // Remove resolved/ignored call from active lists
              set(state => {
                const filtered = state.calls.filter(c => c.id !== updatedCall.id)
                const isEscalatedMatch = state.escalatedCall?.id === updatedCall.id
                return {
                  calls: filtered,
                  escalatedCall: isEscalatedMatch ? null : state.escalatedCall
                }
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(publicChannel)
      supabase.removeChannel(dbChannel)
      // Clear any remaining timers
      Object.values(timers).forEach(clearTimeout)
    }
  },

  forwardCall: async (callId, staffId, privateId) => {
    try {
      // Update database: set attended_by to staffId but keep pending (or change status as needed)
      // Setting attended_by specifies who should address it
      const { error } = await supabase
        .from('staff_calls')
        .update({
          attended_by: staffId
        })
        .eq('id', callId)

      if (error) throw error

      // Direct broadcast message to the staff POS via the private channel
      const targetCall = get().calls.find(c => c.id === callId)
      const privateChannelName = targetCall?.location_id
        ? `private-calls:${privateId}:${targetCall.location_id}`
        : `private-calls:${privateId}`
      const privateChannel = supabase.channel(privateChannelName)
      await privateChannel.send({
        type: 'broadcast',
        event: 'forward_call',
        payload: {
          callId: callId,
          staffId: staffId,
          tableName: targetCall?.tableName || 'Table'
        }
      })

      // Update state and dismiss escalation modal
      set(state => ({
        escalatedCall: state.escalatedCall?.id === callId ? null : state.escalatedCall
      }))
      toast.success('Call Forwarded', `Assigned ${targetCall?.tableName} to staff.`)
    } catch (err) {
      console.error('Failed to forward staff call:', err)
      toast.error('Error', 'Failed to forward call to staff')
    }
  },

  clearEscalation: () => {
    set({ escalatedCall: null })
  }
}))
