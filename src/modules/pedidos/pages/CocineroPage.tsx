import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPedidos, cambiarEstadoPedido } from "../../../api/pedidosApi"
import { useNotification } from "../../../hooks/useNotification"
import type { IPedido, EstadoPedido, IPedidoList} from "../../../types/IPedido"
import { TRANSICIONES_VALIDAS, ESTADO_LABELS } from "../../../types/IPedido"
import { PageHeader } from "../../../ui/PageHeader"
import { Notification } from "../../../ui/Notification"
import { PedidosFinalizadosModal, DetalleItems } from "../components/PedidosFinalizadosModal"
import { KanbanCard } from "../components/KanbanCard"
import { useOrderStatusWS, type IWsEvent } from "../../../hooks/useOrderStatusWS"
import { useAuthStore } from "../../../store/useAuthStore"

// Solo los estados visibles del tablero
const ESTADOS_ORDENADOS: EstadoPedido[] = [
    "CONFIRMADO", 
    "EN_PREP", 
    "LISTO"
]

// No reutiliza KabanColumn porque usa un subconjunto de estados distintos
const COLUMN_ACCENT: Partial<Record<EstadoPedido, string>> = {
    CONFIRMADO: "border-t-primary",
    EN_PREP:    "border-t-primary-container",
    LISTO:      "border-t-tertiary",
}

export function CocineroPage() {
    const queryClient = useQueryClient()
    const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification()

    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [showTerminados, setShowTerminados] = useState(false)
    // misma queryKey que PedidoPage para compartir cache
    const { data, isLoading, isError } = useQuery({
        queryKey: ["pedidos"],
        queryFn: getPedidos,
    })

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

    const avanzarMutation = useMutation({
        mutationFn: ({ pedidoId, estadoHacia }: { pedidoId: number; estadoHacia: EstadoPedido }) =>
            cambiarEstadoPedido(pedidoId, { estado_hacia: estadoHacia }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pedidos"] })
            mostrarExito("Estado actualizado correctamente")
            setLoadingId(null)
        },
        onError: () => {
            mostrarError("Error al actualizar el estado")
            setLoadingId(null)
        }
    })

    const{ isConnected } = useOrderStatusWS({
        enabled: isAuthenticated,
        onMessage: useCallback((msg: IWsEvent) => {
            if (msg.event === "WS_CONNECTED") {
                queryClient.invalidateQueries({ queryKey: ["pedidos"] })
                return
            }
            if (msg.event.startsWith("PEDIDO_") || msg.event === "NUEVO_PEDIDO") {
                queryClient.invalidateQueries({ queryKey: ["pedidos"] })
            }
        }, [queryClient])
    })

    const handleAvanzar = (pedido: IPedido) => {
        const siguientes = TRANSICIONES_VALIDAS[pedido.estado_codigo]
        if (siguientes.length === 0) return
        setLoadingId(pedido.id)
        avanzarMutation.mutate({ pedidoId: pedido.id, estadoHacia: siguientes[0] })
    }

    const handleExpand = (id: number) => {
        setExpandedId(prev => prev === id ? null : id)
    }
    //Agrupa los pedidos por estados en un solo recorrido sobre ESTADOS_ORDENADOS
    const pedidosPorEstado = ESTADOS_ORDENADOS.reduce<Partial<Record<EstadoPedido, IPedido[]>>>(
        (acc, estado) => {
            acc[estado] = (data?.data ?? []).filter(p => p.estado_codigo === estado)
            return acc
        }, {}
    )

    const terminados = (data?.data ?? []).filter(p => p.estado_codigo === "ENTREGADO")

    return (
        <div className="p-8 flex flex-col">

            <PageHeader
                title="Cocina"
                subtitle="Pedidos en preparacion"
            />

            {!isConnected && (
                <div className= "flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-error-container text-on-error-container text-sm">
                    <span className= "material-symbols-outlined text-base">wifi_off</span>
                    Sin conexion en tiempo real
                </div>
            )}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setShowTerminados(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-success/40 bg-success/10 text-success text-label-md font-medium hover:bg-success/20 transition-colors"
                >
                    <span className="w-2 h-2 rounded-full bg-success inline-block" />
                    Terminados ({terminados.length})
                </button>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-16 gap-3 text-secondary">
                    <span className="material-symbols-outlined animate-spin text-[24px] overflow-hidden">progress_activity</span>
                    <span className="text-body-md">Cargando pedidos...</span>
                </div>
            )}

            {isError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-body-md">
                    <span className="material-symbols-outlined text-[18px] overflow-hidden">error</span>
                    Ocurrio un error al cargar los pedidos
                </div>
            )}

            {data && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {ESTADOS_ORDENADOS.map(estado => (
                        <div
                            key={estado}
                            className={`flex flex-col w-72 shrink-0 bg-surface-container-low rounded-xl border-t-4 ${COLUMN_ACCENT[estado]} border border-outline-variant`}
                        >
                            <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                                <span className="text-label-lg font-semibold text-on-surface">{ESTADO_LABELS[estado]}</span>
                                <span className="text-label-md text-secondary bg-surface-container px-2 py-0.5 rounded-full">
                                    {(pedidosPorEstado[estado] ?? []).length}
                                </span>
                            </div>
                            <div className="flex flex-col gap-3 p-3 overflow-y-auto max-h-[calc(100vh-240px)]">
                                {(pedidosPorEstado[estado] ?? []).length === 0 ? (
                                    <p className="text-label-md text-secondary text-center py-8 italic">Sin pedidos</p>
                                ) : (
                                    (pedidosPorEstado[estado] ?? []).map(pedido => (
                                        <KanbanCard
                                            key={pedido.id}
                                            pedido={pedido}
                                            isExpanded={expandedId === pedido.id}
                                            onClick={() => handleExpand(pedido.id)}
                                            onAvanzar={() => handleAvanzar(pedido)}
                                            isLoading={loadingId === pedido.id}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PedidosFinalizadosModal
                isOpen={showTerminados}
                onClose={() => setShowTerminados(false)}
                title="Pedidos Terminados"
                pedidos={terminados}
                estadoLabel="Entregado"
                estadoColor="success"
                expandLabel="Ver detalle"
                renderExpanded={(id) => <DetalleItems pedidoId={id} />}
            />

            <Notification
                mensajeExito={mensajeExito}
                mensajeError={mensajeError}
            />
        </div>
    )
}
