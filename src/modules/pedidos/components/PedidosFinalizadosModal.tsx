import { useState, type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import type { IPedido } from "../../../types/IPedido"
import { getDetallesPedido, getHistorialPedido } from "../../../api/pedidosApi"
import { ListModal } from "../../../ui/ListModal"

export function DetalleItems ({ pedidoId }: { pedidoId: number }){
    const { data, isLoading } = useQuery({
        queryKey: ["detallesPedido", pedidoId],
        queryFn: ()=> getDetallesPedido (pedidoId),
    })

    return (
        <>
            {isLoading && (
                <p className= "text-body-sm text-secondary py-2">Cargando items...</p>

            )}

            {!isLoading && (!data || data.data.length === 0) && (
                <p className = "text-body-sm text-secondary py-2 italic"> Sin items registrados</p>
            )}

            {!isLoading && data && data.data.length > 0 && (
                <ul className= "flex flex-col gap-1 pt-2">
                    {data.data.map((item, i) => (
                        <li key= {i} className= "flex justify-between text-body-sm text-on-surface-variant">
                            <span> {item.nombre_snapshot} x {item.cantidad} </span>
                            <span> {item.subtotal_snapshot} </span>
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export function DetalleMotivo({ pedidoId }: { pedidoId: number }) {
    const { data, isLoading } = useQuery({
        queryKey: ["historialPedido", pedidoId],
        queryFn: () => getHistorialPedido(pedidoId),
    })

    const motivo = data?.find(h => h.estado_hacia === "CANCELADO")?.motivo

    return (
        <>
            {isLoading && (
                <p className="text-body-sm text-secondary py-2">Cargando motivo...</p>
            )}
            {!isLoading && (
                <p className="text-body-sm text-on-surface-variant pt-2 italic">
                    {motivo ?? "Sin motivo registrado"}
                </p>
            )}
        </>
    )
}

// --- Modal genérico ---

const ESTADO_COLOR: Record<"success" | "error" | "secondary", string> = {
    success:   "text-success",
    error:     "text-error",
    secondary: "text-secondary",
}

interface Props {
    isOpen: boolean
    onClose: () => void
    title: string
    pedidos: IPedido[]
    estadoLabel: string
    estadoColor: "success" | "error" | "secondary"
    expandLabel: string
    renderExpanded: (pedidoId: number) => ReactNode
}

export function PedidosFinalizadosModal({isOpen, onClose, title, pedidos, estadoLabel, estadoColor, expandLabel, renderExpanded}: Props) {
    
    const [expandedId, setExpandedId] = useState<number | null>(null)

    return (
        <ListModal isOpen={isOpen} onClose={onClose} title={title}>
            {pedidos.length === 0 && (
                <p className="text-body-md text-secondary text-center py-8 italic">Sin pedidos</p>
            )}
            {pedidos.map((pedido) => (
                <div key={pedido.id} className="bg-surface-container-low rounded-xl border border-outline-variant px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <span className="text-label-lg font-bold text-primary">#{pedido.id}</span>
                            <p className="text-body-sm text-on-surface-variant">Usuario #{pedido.usuario_id}</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-body-md font-semibold text-on-surface">${pedido.total}</p>
                            <p className={`text-label-md uppercase tracking-wide ${ESTADO_COLOR[estadoColor]}`}>
                                {estadoLabel}
                            </p>
                        </div>
                        <button
                            onClick={() => setExpandedId(expandedId === pedido.id ? null : pedido.id)}
                            className="shrink-0 px-3 py-1.5 rounded-lg border border-outline-variant text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
                        >
                            {expandedId === pedido.id ? "Ocultar" : expandLabel}
                        </button>
                    </div>

                    {expandedId === pedido.id && (
                        <div className="border-t border-outline-variant mt-3 pt-1">
                            {renderExpanded(pedido.id)}
                        </div>
                    )}
                </div>
            ))}
        </ListModal>
    )
}