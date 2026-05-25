interface TableActionsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  disabled?: boolean
}

/**
 * Botones de acción estándar para filas de tabla.
 * Cada botón es opcional — si no se pasa la función, no se renderiza.
 */
export function TableActions({ onView, onEdit, onDelete, disabled = false }: TableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onView && (
        <button
          onClick={onView}
          disabled={disabled}
          title="Ver"
          className="w-9 h-9 flex items-center justify-center text-secondary hover:bg-surface-container-high rounded-full transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[20px] overflow-hidden">visibility</span>
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          disabled={disabled}
          title="Editar"
          className="w-9 h-9 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-50">
          <span className="material-symbols-outlined text-[20px] overflow-hidden">edit</span>
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={disabled}
          title="Eliminar"
          className="w-9 h-9 flex items-center justify-center text-error hover:bg-error/10 rounded-full transition-colors disabled:opacity-50">
          <span className="material-symbols-outlined text-[20px] overflow-hidden">delete</span>
        </button>
      )}
    </div>
  )
}