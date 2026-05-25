interface PageHeaderProps {
  title: string
  subtitle: string
  buttonLabel?: string
  onButtonClick?: () => void
}

/**
 * Encabezado estándar de página.
 * Muestra título, subtítulo y opcionalmente un botón de acción primaria.
 * El botón solo se renderiza si se pasan buttonLabel y onButtonClick.
 */
export function PageHeader({ title, subtitle, buttonLabel, onButtonClick }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">{title}</h1>
        <p className="text-body-md text-secondary mt-1">{subtitle}</p>
      </div>                                                  
      {buttonLabel && onButtonClick && (
        <button                                                                   
            onClick={onButtonClick}
            className="flex items-center gap-2 bg-primary hover:opacity-90 text-on-primary px-6 py-3 rounded-lg text-label-lg font-medium ambient-shadow transition-opacity">
          <span className="material-symbols-outlined text-[20px] overflow-hidden">add_circle</span>
          {buttonLabel}
        </button>
      )}
    </div>
  )
}