import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getPedidos, cambiarEstadoPedido } from "../../../api/pedidosApi"
import { useNotification } from "../../../hooks/useNotification"
import type { IPedido, EstadoPedido } from "../../../types/IPedido"
import { TRANSICIONES_VALIDAS } from "../../../types/IPedido"
import { KanbanColumn } from "../components/KabanColumn"
import { PageHeader } from "../../../ui/PageHeader"
import { Notification } from "../../../ui/Notification"

//Orden en que aparecen las columnas
const ESTADOS_ORDENADOS: EstadoPedido[] = [
    "PENDIENTE",
    "CONFIRMADO",
    "EN_PREP",
    "LISTO",
    "ENTREGADO",
    "CANCELADO",
]

// Tablero de gestion
// trae todos los pedidos de una sola query y los agrupa por estado
// expand y loading se maneja para que solo una card este activa
export function PedidosPage() {
    const queryClient = useQueryClient()
    const { mensajeExito, mensajeError, mostrarExito, mostrarError } = useNotification()

    //Estado local, guarda un solo ID, ya que solo una card puede esta expandida 
    //y solo una puede esta en loading al mismo tiempo
    const [ expandedId, setExpandedId ] = useState <number | null> (null)
    const [ loadingId, setLoadingId ] = useState <number | null> (null)

    const [ cancelConfirmId, setCancelConfirmId] = useState <number | null > (null)

    const { data, isLoading, isError } = useQuery ({
        queryKey: ["pedidos"],
        queryFn: getPedidos,
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

    return (
        <div className= "p-8 flex flex-col">

            <PageHeader
                title= "Gestion de Pedidos"
                subtitle= "Tablero de control de pedidos en tiempo real"
            />

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
                        />
                    ))}
                </div>
            )}

            <Notification mensajeExito= {mensajeExito} mensajeError= {mensajeError} />
        </div>
    )
}