import { useState, useEffect } from "react"
import type { IPedido, EstadoPedido, IHistorialEstado } from "../../../types/IPedido"
import { ESTADO_LABELS, TRANSICIONES_VALIDAS} from "../../../types/IPedido"
import { StatusBadge } from "../../../ui/StatusBadge"
import { useQuery } from "@tanstack/react-query"
import { getDetallesPedido, getHistorialPedido } from "../../../api/pedidosApi"
import { MotivoCard } from "./MotivoCard"

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
    onCancelar: (motivo: string)=> void
    onCancelConfirmReset: ()=> void
    isCancelConfirm: boolean
    isLoading: boolean
}


// Tarjeta de pedido tiene 2 modos colapsado y expandido
export function KanbanCard({ pedido, isExpanded, onClick, onAvanzar, onCancelar, onCancelConfirmReset, isCancelConfirm, isLoading }: KanbanCardProps) {
    const botonLabel = BOTON_LABEL [pedido.estado_codigo]
    const [motivo, setMotivo] = useState("")

    useEffect(() => {
        if (!isCancelConfirm) setMotivo("")
    }, [isCancelConfirm])

    const esTerminal = pedido.estado_codigo === "ENTREGADO" || pedido.estado_codigo === "CANCELADO"
    const puedeCancelar = TRANSICIONES_VALIDAS [pedido.estado_codigo].includes("CANCELADO")

    const { data: detalles, isLoading: isLoadingDetalles, isError: isErrorDetalles } = useQuery ({
        queryKey: ["detallesPedido", pedido.id],
        queryFn: () => getDetallesPedido (pedido.id),
        enabled: isExpanded
    })

    if (!isExpanded) {
        return (
            <article
                onClick={onClick}
                className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
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
                        <p className= "text-label-md text-secondary uppercase tracking-wider mb-1">Pago</p>
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
                        <div className= "bg-surface-container-low p-3 rounded-lg border border-outline-variant italic text-body-md text-on-surface-variant">"{pedido.notas}</div>
                    </div>
                )}

                {/* Items del pedido */}
                <div>
                    <p className = "text-label-md text-secondary uppercase tracking-wider mb-2"> Items del pedido</p>

                    {isLoadingDetalles && (
                        <div className= "flex items-center gap-2 text-body-md text-on-surface-variant py-2">
                            <span className = "material-symbols-outlined animate-spin text-[16px] overflow-hidden">progress_activity</span>
                            Cargando items ...
                        </div>
                    )}

                    {isErrorDetalles && (
                        <p className = "text-body-md text-error py-2"> No se pudieron cargar los items.</p>
                    )}

                    {detalles && detalles.data.length === 0 && (
                        <p className= "text-body-md text-on-surface-variant py-2 italic"> Sin items registrados</p>
                    )}

                    {detalles && detalles.data.length > 0 && (
                        <ul className= "flex flex-col gap-2">
                            {detalles.data.map((item, index) => (
                                <li key={index} className= "bg-surface-container-low rounded-lg border border-outline-variant px-3 py-2 flex justify-between items-start">
                                    <div>
                                        <p className= "text-body-md font-medium text-on-surface">{item.nombre_snapshot}</p>
                                        <p className= "text-label-md text-secondary">x{item.cantidad} . ${item.precio_snapshot}</p>
                                    </div>
                                    <p className = "text-body-md font-semibold text-on-surface">${item.subtotal_snapshot}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Boton avanzar */}
            {!esTerminal && (
                <div className="px-4 pb-4 flex flex-col gap-2">
                    
                    {botonLabel && (
                    <button
                        onClick= {onAvanzar}
                        disabled={isLoading}
                        className= "w-full bg-primary-container text-on-primary-container py-3 rounded-xl text-label-lg font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">

                        {isLoading ? (
                            <span className= "material-symbols-outlined animate-spin text-[18px] overflow-hidden">progress_activity</span>
                        ) : (
                            <span className= "material-symbols-outlined text-[18px] overflow-hidden">trending_flat</span>
                        )}
                        {isLoading ? "Actualizando..." : botonLabel}

                    </button>
            )}

            {puedeCancelar && !isCancelConfirm && (
                <button
                    onClick = {()=> onCancelar("")}
                    disabled = {isLoading}
                    className = "w-full py-2 rounded-xl text-label-md text-error border border-error/30 hover:bg-error-container hover:text-on-error-container transition-colors disabled:opacity-50">
                        Cancelar pedido
                    </button>
            )}

            {puedeCancelar && isCancelConfirm && (
                <div className= "flex flex-col gap-2">
                    <p className= "text-label-md text-error text-center"> ¿Confirmar cancelacion?</p>
                    <input
                        type= "text"
                        placeholder= "Motivo de cancelacion (requerido)"
                        value={motivo}
                        onChange= {(e)=> setMotivo(e.target.value)}
                        className = "w-full px-3 py-2 rounded-lg border border-error/30 text-body-sm bg-surface-container text-on-surface focus:outline-none focus:border-error"
                    />
                    <div className= "flex gap-2">
                        <button
                            onClick= {onCancelConfirmReset}
                            className= "flex-1 py-2 rounded-xl text-label-md border border-outline-variant text-secondary hover:bg-surface-container transition-colors">
                                No
                        </button>
                        <button
                            onClick= {() => onCancelar(motivo)}
                            disabled= {isLoading || !motivo.trim()}
                            className = "flex-1 py-2 rounded-xl text-label-md bg-error text-on-error hover:brightness-110 transition-all disabled:opacity-50">
                                {isLoading ? "Cancelando..." : "Si, cancelar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
            )}
            {esTerminal && (
                <div className= "px-4 pb-4">
                    {pedido.estado_codigo === "CANCELADO" ? (
                        <MotivoCard pedidoId ={pedido.id} isExpanded= {isExpanded}/>
                    ) : (
                    <div className = "w-full py-3 rounded-xl text-label-lg flex items-center justify-center gap-2 bg-surface-container text-secondary">
                        <span className="material-symbols-outlined text-[18px] overflow-hidden">check_circle</span>
                        Pedido finalizado
                    </div>
                    )}
                </div>
            )}
        </article>
    )
}