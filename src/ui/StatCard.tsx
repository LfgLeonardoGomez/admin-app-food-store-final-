type StatCardVariant = "default" | "error" | "warning"

interface StatCardProps {
  label: string
  value: number | string
  variant?: StatCardVariant
}

const VALUE_COLOR: Record<StatCardVariant, string> = {
  default: "text-primary",
  error:   "text-error",
  warning: "text-warning",
}

/**
 * Tarjeta de métrica para el encabezado de las páginas de inventario.
 * @param label - Título de la métrica en mayúsculas (ej: "TOTAL INGREDIENTES")
 * @param value - Valor numérico o texto a mostrar en grande
 * @param variant - Color del valor: default (azul), error (rojo), warning (naranja)
 *
 * Usos:
 * - Ingredientes: "TOTAL INGREDIENTES" (default) / "STOCK CRÍTICO" (error)
 * - Productos: "TOTAL PRODUCTOS" (default) / "SIN STOCK" (error)
 * - Pedidos: "PEDIDOS PENDIENTES" (warning)
 */
export function StatCard({ label, value, variant = "default" }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant ambient-shadow flex flex-col gap-1">
      <p className="text-label-md text-secondary uppercase tracking-wider">{label}</p>
      <p className={`text-display font-bold ${VALUE_COLOR[variant]}`}>{value}</p>
    </div>
  )
}