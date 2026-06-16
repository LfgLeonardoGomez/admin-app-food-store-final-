interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  itemLabel: string
  isLoading: boolean
  onPrev: () => void
  onNext: () => void
}

/**
 * Pie de tabla con paginación estándar.
 * Muestra "Mostrando X de Y {itemLabel}" y botones prev/next.
 * @param itemLabel - Nombre del recurso en plural (ej: "categorías", "ingredientes")
 */
export function Pagination({ page, totalPages, total,pageSize, itemLabel, isLoading, onPrev, onNext }: PaginationProps) {
  return (
    <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
      <p className="text-body-md text-secondary">
        Mostrando <strong>{Math.min((page + 1) * pageSize, total)}</strong> de <strong>{total}</strong> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        
        <button
          onClick={onPrev}
          disabled={page === 0 || isLoading}
          className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high text-secondary transition-colors disabled:opacity-50">
          <span className="material-symbols-outlined overflow-hidden">chevron_left</span>
        </button>
        <span className="text-label-md px-4">{page + 1}</span>

        <button
          onClick={onNext}
          disabled={page + 1 >= totalPages || isLoading}
          className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high text-secondary transition-colors disabled:opacity-50">
          <span className="material-symbols-outlined overflow-hidden">chevron_right</span>
        </button>
      </div>
    </div>
  )
}