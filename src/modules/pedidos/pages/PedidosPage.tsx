import { useState, useCallback} from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPedidos, cambiarEstadoPedido } from "../../../api/pedidosApi"
import { useNotification } from "../../../hooks/useNotification"
import type { IPedido, EstadoPedido, IPedidoList } from "../../../types/IPedido"
import { TRANSICIONES_VALIDAS } from "../../../types/IPedido"
import { KanbanColumn } from "../components/KabanColumn"
import { PageHeader } from "../../../ui/PageHeader"
import { Notification } from "../../../ui/Notification"
import { PedidosFinalizadosModal, DetalleItems, DetalleMotivo } from "../components/PedidosFinalizadosModal"
import { useAuthStore } from "../../../store/useAuthStore"
import { useOrderStatusWS, type IWsEvent } from "../../../hooks/useOrderStatusWS"

//Orden en que aparecen las columnas
const ESTADOS_ORDENADOS: EstadoPedido[] = [
    "PENDIENTE",
    "CONFIRMADO",
    "EN_PREP",
    "LISTO",
]

// Tablero de gestion
// trae todos los pedidos de una sola query y los agrupa por estado
// expand y loading se maneja para que solo una card este activa
export function PedidosPage() {
    const queryClient = useQueryClient()
    const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification()

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    
    //Estado local, guarda un solo ID, ya que solo una card puede esta expandida 
    //y solo una puede esta en loading al mismo tiempo
    const [ expandedId, setExpandedId ] = useState <number | null> (null)
    const [ loadingId, setLoadingId ] = useState <number | null> (null)

    const [ cancelConfirmId, setCancelConfirmId] = useState <number | null > (null)

    const [showEntregados, setShowEntregados] = useState (false)
    const [showCancelados, setShowCancelados] = useState (false)

    const { data, isLoading, isError } = useQuery ({
        queryKey: ["pedidos"],
        queryFn: getPedidos,
    })

    const { isConnected } = useOrderStatusWS({
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

    // Llama al endpoint, si tiene extio invalida el cache para que React re-fetche
    //asi aparece la card en la nueva columna
    const avanzarMutation = useMutation ({
        mutationFn: ({ pedidoId, estadoHacia }: { pedidoId:number; estadoHacia: EstadoPedido }) =>
            cambiarEstadoPedido (pedidoId, {estado_hacia: estadoHacia }),
        onSuccess: () => {
            queryClient.invalidateQueries ({ queryKey: ["pedidos"] })
            mostrarExito( "Estado actualizado correctamente ")
            setLoadingId (null)
        },
        onError: ()=> {
            mostrarError ("Error al actualizar el estado")
            setLoadingId (null)
        }
    })

    // Consulta las transiciones validas para saber a que estado ir.
    // Si ya esta en estado terminal el array esta vacio y no hace nada
    // Toma el primer estado valido
    const handleAvanzar = (pedido: IPedido) => {
        const siguientes = TRANSICIONES_VALIDAS [pedido.estado_codigo]
        if (siguientes.length === 0 ) return
        setLoadingId(pedido.id)
        avanzarMutation.mutate ({ pedidoId: pedido.id, estadoHacia: siguientes [0] })
    }

    const cancelarMutation = useMutation ({
        mutationFn: ({ pedidoId, motivo }: {pedidoId: number; motivo: string}) =>
            cambiarEstadoPedido(pedidoId, { estado_hacia: "CANCELADO", motivo}),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["pedidos"] })
            mostrarExito("Pedido cancelado")
            setLoadingId(null)
            setCancelConfirmId(null)
        },
        onError: () => {
            mostrarError("Error al cancelar el pedido")
            setLoadingId(null)
            setCancelConfirmId(null)
        }
    })

    const handleCancelar = (pedido: IPedido, motivo: string) => {
        if (cancelConfirmId !== pedido.id) {
            setCancelConfirmId (pedido.id)
            return
        }
        setLoadingId(pedido.id)
        cancelarMutation.mutate({pedidoId: pedido.id, motivo})
    }

    // Toggle para que cuando se haga click en una expandida se colapse y si se hace click en otra se expande
    const handleExpand = (id: number) => {
        setExpandedId ((prev) => (prev === id ? null : id))
    }

    // reduce recorre el array de estados y filtra los pedidos que tienen
    // el estado_codigo. Devuelve un objeto que se pasa a cada columna
    const pedidosPorEstado = ESTADOS_ORDENADOS.reduce<Record<EstadoPedido, IPedido [] >> (
        (acc, estado) => {
            acc[estado] = (data?.data ?? []).filter((p) => p.estado_codigo === estado)
            return acc
        },
        {} as Record<EstadoPedido, IPedido []>
    )

    const entregados = (data?.data ?? []).filter(p => p.estado_codigo === "ENTREGADO")
    const cancelados  = (data?.data ?? []).filter(p => p.estado_codigo === "CANCELADO")
    
    return (
        <div className= "p-8 flex flex-col">

            <PageHeader
                title= "Gestion de Pedidos"
                subtitle= "Tablero de control de pedidos en tiempo real"
            />

            {!isConnected && (
                <div className= "flex items-center gap-2 px-3 py-2 mb-4 rounded-lg bg-error-container text-on-error-container text-sm">
                    <span className= "material-symbols-outlined text-base">wifi_off</span>
                    Sin conexion en tiempo real
                </div>
            )}

            <div className= "flex gap-3 mb-6">
                <button
                    onClick= { () => setShowEntregados(true)}
                    className = "flex items-center gap-2 px-4 py-2 rounded-full border border-success/40 bg-success/10 text-success text-label-md font-medium hover:bg-success/20 transition-colors">
                    <span className= "w-2 h-2 rounded-full bg-success inline-block" />

                    Entregados ({entregados.length})
                </button>

                <button
                    onClick= {() => setShowCancelados (true)}
                    className= "flex items-center gap-2 px-4 py-2 rounded-full border border-error/40 bg-error/10 text-error text-label-md font-medium hover:bg-error/20 transition-colors">
                    <span className= "w-2 h-2 rounded-full bg-error inline-block" />

                    Cancelados ({cancelados.length})
                </button>
            </div>

            {isLoading && (
                <div className= "flex items-center justify-center py-16 gap-3 text-secondary">
                    <span className= "material-symbols-outlined animate-spin text-[24px] overflow-hidden">progress_activity</span>
                    <span className= "text-body-md">Cargando pedidos ...</span>
                </div>
            )}

            {isError && (
                <div className= "flex items-center gap-2 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-body-md">
                    <span className= "material-symbols-outlined text-[18px] overflow-hidden">error</span>
                    Ocurrio un error al cargar los pedidos
                </div>
            )}

            {/* Solo renderiza el tablero cuando llegaron los datos. overflow permite el scroll horizontal*/}
            {data && (
                <div className= "flex gap-4 overflow-x-auto pb-4">
                    {ESTADOS_ORDENADOS.map((estado) => (
                        <KanbanColumn
                            key= {estado}
                            estado= {estado}
                            pedidos= {pedidosPorEstado [estado]}
                            expandedId = {expandedId}
                            loadingId = {loadingId}
                            cancelConfirmId = {cancelConfirmId}
                            onExpand = {handleExpand}
                            onAvanzar = {handleAvanzar}
                            onCancelar={handleCancelar}
                            onCancelConfirmReset = {() => setCancelConfirmId(null)}
                            ocultarBotonAvanzar = {estado === "CONFIRMADO" || estado === "EN_PREP"}
                        />
                    ))}
                </div>
            )}

            <PedidosFinalizadosModal
                isOpen= {showEntregados}
                onClose= {()=> setShowEntregados(false)}
                title= "Pedidos Entregados"
                pedidos= {entregados}
                estadoLabel= "Entregado"
                estadoColor= "success"
                expandLabel= "Ver detalle"
                renderExpanded= {(id) => <DetalleItems pedidoId = {id} />}
            />

            <PedidosFinalizadosModal
                isOpen={showCancelados}
                onClose={() => setShowCancelados(false)}
                title="Pedidos Cancelados"
                pedidos={cancelados}
                estadoLabel="Cancelado"
                estadoColor="error"
                expandLabel="Ver motivo"
                renderExpanded={(id) => <DetalleMotivo pedidoId={id} />}
            />

            <Notification mensajeExito= {mensajeExito} mensajeError= {mensajeError} />
        </div>
    )
}