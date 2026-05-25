interface ConfirmDeleteModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-xl ambient-shadow w-full max-w-[24rem] p-8">

        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-error-container overflow-hidden">
            <span className="material-symbols-outlined text-on-error-container text-[20px]">delete</span>
          </div>
          <h3 className="text-headline-md font-semibold text-on-surface pt-1">{title}</h3>
        </div>

        <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-outline-variant text-label-lg font-medium text-on-surface-variant hover:bg-surface-container disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-error rounded-lg text-label-lg font-medium text-on-error hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px] overflow-hidden">progress_activity</span>
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </button>
        </div>

      </div>
    </div>
  )
}