'use client'

import { useState } from 'react'

export function TableSessionModal({ storeName, prefilledTable, onConfirm }: {
  storeName: string; prefilledTable: string | null
  onConfirm: (tableNumber: string) => void
}) {
  const [table, setTable] = useState(prefilledTable || '')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    const trimmed = table.trim()
    if (!trimmed) { setError('Please enter your table number'); return }
    onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-850">Welcome to {storeName}</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your table number to get started</p>
        </div>
        <input
          type="text"
          value={table}
          onChange={e => { setTable(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g. 4 or T-12"
          className="w-full border-2 border-gray-200 focus:border-[var(--primary)] rounded-xl px-4 py-3 text-center text-xl font-bold outline-none transition-colors"
          autoFocus
        />
        {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-3 rounded-xl text-white font-bold text-lg cursor-pointer hover:opacity-95 transition-all"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {"Let's Go →"}
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">
          Your table number is on the QR code stand or card
        </p>
      </div>
    </div>
  )
}
