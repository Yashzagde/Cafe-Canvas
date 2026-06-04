import { cn } from '../../lib/utils'
import { ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'

// ─── Data Table ──────────────────────────────────────────────────────────────

interface Column<T> {
  key: string
  header: string
  width?: string
  sortable?: boolean
  render?: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  selectedKey?: string
  emptyMessage?: string
  loading?: boolean
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  // Pagination
  page?: number
  pageSize?: number
  totalCount?: number
  onPageChange?: (page: number) => void
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  selectedKey,
  emptyMessage = 'No records found.',
  loading,
  sortKey,
  sortDir,
  onSort,
  page,
  pageSize,
  totalCount,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = totalCount && pageSize ? Math.ceil(totalCount / pageSize) : undefined

  if (loading) {
    return (
      <div className="bg-canvas-surface rounded-xl border border-canvas-border overflow-hidden">
        <div className="animate-pulse p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-canvas-border/40 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-canvas-surface rounded-xl border border-canvas-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-semibold text-canvas-brown border-collapse">
          <thead>
            <tr className="border-b border-canvas-border text-canvas-brown_mid bg-canvas-cream/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'py-3 px-4 whitespace-nowrap',
                    col.sortable && 'cursor-pointer hover:text-canvas-brown select-none',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown
                        className={cn(
                          'w-3 h-3 transition-transform',
                          sortKey === col.key ? 'text-canvas-terracotta' : 'text-canvas-brown_light',
                          sortKey === col.key && sortDir === 'desc' && 'rotate-180'
                        )}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-border/50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-canvas-brown_mid">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowKey = keyExtractor(row)
                return (
                  <tr
                    key={rowKey}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer',
                      selectedKey === rowKey
                        ? 'bg-canvas-terracotta/5 border-l-2 border-l-canvas-terracotta'
                        : 'hover:bg-canvas-cream/30'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'py-3 px-4',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {col.render
                          ? col.render(row, idx)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages !== undefined && totalPages > 1 && page !== undefined && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-canvas-border bg-canvas-cream/30">
          <span className="text-[10px] text-canvas-brown_mid font-bold">
            Page {page} of {totalPages} · {totalCount} records
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded hover:bg-canvas-surface disabled:opacity-30 disabled:cursor-not-allowed text-canvas-brown_mid"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded hover:bg-canvas-surface disabled:opacity-30 disabled:cursor-not-allowed text-canvas-brown_mid"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
