'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function CallStaffButton({ tenantId, tableNumber, sessionToken: _sessionToken }: {
  tenantId: string; tableNumber: string; sessionToken: string
}) {
  const supabase = createClient()
  const [status, setStatus]     = useState<'idle' | 'calling' | 'done' | 'error'>('idle')
  const [cooldown, setCooldown] = useState(false)

  const handleCall = async () => {
    if (cooldown) return

    setStatus('calling')

    // 1. Insert staff_call record
    const { data: call, error } = await supabase
      .from('staff_calls')
      .insert({
        tenant_id:    tenantId,
        table_number: tableNumber,
        message:      'Customer requesting assistance',
        status:       'pending',
      })
      .select('id')
      .single()

    if (error) { setStatus('error'); return }

    // 2. Broadcast via Supabase Realtime to all staff apps
    await supabase
      .channel(`tenant-${tenantId}-ops`)
      .send({
        type:    'broadcast',
        event:   'staff_call',
        payload: {
          call_id:      call.id,
          table_number: tableNumber,
          timestamp:    new Date().toISOString(),
        }
      })

    setStatus('done')
    setCooldown(true)

    // Reset after 30 seconds
    setTimeout(() => {
      setStatus('idle')
      setCooldown(false)
    }, 30000)
  }

  return (
    <button
      onClick={handleCall}
      disabled={cooldown}
      className={`fixed bottom-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white text-sm font-bold transition-all ${
        status === 'done'
          ? 'bg-green-500 hover:bg-green-600'
          : cooldown
          ? 'bg-gray-400 cursor-not-allowed'
          : 'active:scale-95'
      }`}
      style={!cooldown && status !== 'done' ? { backgroundColor: 'var(--primary)' } : {}}
    >
      {status === 'idle'    && '🔔 Call Staff'}
      {status === 'calling' && '⏳ Calling...'}
      {status === 'done'    && '✓ Staff notified'}
      {status === 'error'   && '⚠️ Try again'}
    </button>
  )
}
