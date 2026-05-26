import type { IPedido, EstadoPedido } from "../../../types/IPedido"
import { ESTADO_LABELS} from "../../../types/IPedido"
import { StatusBadge } from "../../../ui/StatusBadge"

const ESTADO_VARIANT: Record<EstadoPedido, "primary" | "secondary" | "success" | "warning" | "error" > = {
    PENDIENTE: "warning",
    CONFIRMADO: "primary",
    EN_PREP: "primary",
    EN_CAMINO: "secondary",
    ENTREGADO: "success",
    CANCELADO: "error",
}

// Solo los estados intermedios tiene el boton de avance
const BOTON_LABEL: Partial <Record<string, string>> = {
    PENDIENTE: "Confirmar pedido",
    CONFIRMADO: "Pasar a preparacion",
    EN_PREP: "Marcar como Listo",
    EN_CAMINO: "Marcar como Entregado",
}

// Si isExpanded es true muestra el detalle completo. sino la vista colapsada
interface KanbanCardProps {
    pedido: IPedido
    isExpanded: boolean
    onClick: ()=> void
    onAvanzar: ()=> void
    isLoading: boolean
}

// Tarjeta de pedido tiene 2 modos colapsado y expandido
export function KanbanCard({ pedido, isExpanded, onClick, onAvanzar, isLoading }: KanbanCardProps) {
    const botonLabel = BOTON_LABEL [pedido.estado_codigo]
    const esTerminal = pedido.estado_codigo === "ENTREGADO" || pedido.estado_codigo === "CANCELADO"

    if (!isExpanded) {
        return (
            <article
                onClick={onClick}
                className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:shadow-md hover:border-primary/40 trasition-all cursor-pointer">
                <p className = "text-label-lg text-secondary mb-1">#{pedido.id}</p>
                <p className = "text-body-md font-medium text-on-surface">Usuario #{pedido.usuario_id}</p>
                <p className = "text-label-md text-secondary mt-1">${pedido.total}</p>
            </article>
        )
    }

    return (
        <article className = "bg-surface-container-lowest rounded-xl border-2 border-primary overflow-hidden shadow-md flex-shrink-0">

            {/* Header */}
            <div className= "px-4 py-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <div className= "flex items-center gap-3">
                    <h3 className= "text-label-lg font-bold text-on-surface">#{pedido.id}</h3>
                    <StatusBadge
                        label={ESTADO_LABELS[pedido.estado_codigo]}
                        variant={ESTADO_VARIANT[pedido.estado_codigo]}
                    />
                </div>
                <button
                    onClick={onClick}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
                    <span className= "material-symbols-outlined text-[18px] overflow-hidden">close</span>
                </button>
            </div>

            {/* Cuerpo */}
            <div className= "p-4 flex flex-col gap-4">
                <div className= "grid grid-cols-2 gap-3 border-b border-outline-variant pb-4">
                    <div>
                        <p className= "text-label-md text-secondary uppercase tracking-wider mb-1"> Cliente</p>
                        <p className= "text-body-md font-medium">Usuario #{pedido.usuario_id}</p>
                    </div>
                    <div>
                        <p className= "text-labe-md text-secondary uppercase tracking-wider mb-1">Pago</p>
                        <p className= "text-body-md">{pedido.forma_pago_codigo}</p>
                    </div>
                    <div>
                        <p className= "text-label-md text-secondary uppercase tracking-wider mb-1"> Envio</p>
                        <p className= "text-body-md">${pedido.costo_envio}</p>
                    </div>
                </div>

                {pedido.notas && (
                    <div>
                        <p className= "text-label-md text-secondary uppercase tracking-wider mb-1">Notas</p>
                        <div className= "bg-surface-container-low p-3 rounded-lg border border-outline-variant italic text-body-md text-onsurface-variant">"{pedido.notas}</div>
                    </div>
                )}
            </div>

            {/* Boton avanzar */}
            {!esTerminal && botonLabel && (
                <div className= "px-4 pb-4">
                    <button
                        onClick= {onAvanzar}
                        disabled={isLoading}
                        className= "w-full bg-primary-container text-on-primary-container py-3 rounded-xl text-label-lg font-semibold flex items-center justify-center gap-2 hover-brightness-110 active-scale-[0.98] transition-all disabled:opacity-50">

                        {isLoading ? (
                            <span className= "material-symbols-outlined animate-spin text-[18px] overflow-hidden">progress_activity</span>
                        ) : (
                            <span className= "material-symbols-outlined text-[18px] overflow-hidden">trending_flat</span>
                        )}
                        {isLoading ? "Actualizando..." : botonLabel}

                    </button>
                </div>
            )}

            {esTerminal && (
                <div className= "px-4 pb-4">
                    <div className = "w-full py-3 rounded-xl text-label-lg flex items-center justify-center gap-2 bg-surface-container text-secondary">
                        <span className="material-symbols-outlined text-[18px] overflow-hidden">check_circle</span>
                        Pedido finalizado
                    </div>
                </div>
            )}
        </article>
    )
}