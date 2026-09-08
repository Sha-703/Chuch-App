import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 8

export function usePagination(items, pageSize = PAGE_SIZE) {
  return { pageSize }
}

export default function Pagination({ page, setPage, total, pageSize = PAGE_SIZE }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  const debut = (page - 1) * pageSize + 1
  const fin = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-ink-950/5">
      <p className="text-xs text-ink-700/60">
        {debut}–{fin} sur {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-ink-950/10 flex items-center justify-center text-ink-800 disabled:opacity-30 hover:border-gold-500/50 transition-colors"
          aria-label="Page précédente"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs font-medium text-ink-700/70 px-2 font-tabular">{page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-ink-950/10 flex items-center justify-center text-ink-800 disabled:opacity-30 hover:border-gold-500/50 transition-colors"
          aria-label="Page suivante"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

export function paginer(items, page, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}
