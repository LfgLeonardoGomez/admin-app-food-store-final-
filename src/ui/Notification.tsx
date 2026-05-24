interface NotificationProps {
  mensajeExito: string | null
  mensajeError: string | null
}

export function Notification({ mensajeExito, mensajeError }: NotificationProps) {
  if (!mensajeExito && !mensajeError) return null

  return (
    <div className="fixed bottom-lg right-lg z-50 flex flex-col gap-sm">
      {mensajeExito && (
        <div className="flex items-center gap-sm rounded-lg bg-success px-md py-sm text-body-md text-on-success shadow-lg">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {mensajeExito}
        </div>
      )}
      {mensajeError && (
        <div className="flex items-center gap-sm rounded-lg bg-error px-md py-sm text-body-md text-on-error shadow-lg">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {mensajeError}
        </div>
      )}
    </div>
  )
}