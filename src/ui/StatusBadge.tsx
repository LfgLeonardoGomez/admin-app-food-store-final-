type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error"

interface StatusBadgeProps {
  label: string
  variant: BadgeVariant
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary:   "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success:   "bg-success/10 text-success",
  warning:   "bg-warning/10 text-warning",
  error:     "bg-error/10 text-error",
}

/**
 * Badge de estado reutilizable.
 * @param variant - Define el color: primary, secondary, success, warning, error
 *
 * Usos:
 * - Categorías: variant="primary" (Categoría) / variant="secondary" (Subcategoría)
 * - Pedidos: variant="warning" (Pendiente), variant="primary" (En preparación),
 *            variant="success" (Entregado), variant="error" (Cancelado)
 * - Ingredientes: variant="success" (alto), variant="warning" (medio), variant="error" (crítico)
 */
export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase ${VARIANT_CLASSES[variant]}`}>
      {label}
    </span>
  )
}