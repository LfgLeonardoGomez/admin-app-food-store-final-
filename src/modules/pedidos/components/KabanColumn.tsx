import type { IPedido, EstadoPedido } from "../../../types/IPedido"
import {ESTADO_LABELS } from "../../../types/IPedido"
import { KanbanCard } from "./KanbanCard"


//Cada columna tiene un color de borde superior
const COLUMN_ACCENT: Record <EstadoPedido, string> = {
    PENDIENTE:  "border-t-warning",
    CONFIRMADO: "border-t-primary",
    EN_PREP:    "border-t-primary",
    EN_CAMINO:  "border-t-secondary",
    ENTREGADO:  "border-t-success",
    CANCELADO:  "border-t-error",
}

// pedidos tiene la lista ya filtrada para el estado- se hace en PedidosPage
interface KanbanColumnProps {
    estado: EstadoPedido
    pedidos: IPedido []
    expandedId: number | null
    loadingId: number | null
    cancelConfirmId: number | null
    onExpand: (id: number) => void  //callback que disparan acciones en la pagina padre
    onAvanzar: (pedido: IPedido) => void
    onCancelar: (pedido: IPedido, motivo: string) => void
    onCancelConfirmReset: () => void
}

// Recibe los pedidos ya filtrados y delega el estado a la PedidosPage
export function KanbanColumn ({ estado, pedidos, expandedId, loadingId, cancelConfirmId, onExpand, onAvanzar, onCancelar, onCancelConfirmReset}: KanbanColumnProps){
    return (
        <div className={`flex flex-col w-72 shrink-0 bg-surface-container-low rounded-xl border-t-4 ${COLUMN_ACCENT[estado]} border border-outline-variant`}>

            <div className= "px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <span className= "text-label-lg font-semibold text-on-surface">{ESTADO_LABELS[estado]}</span>
                <span className= "text-label-md text-secondary bg-surface-container px-2 py-0.5 rounded-full"> {pedidos.length}</span>
            </div>

            {/*Si hay pedidos mapea cada uno a un kanbacard- si la card coincide con ID es la que se expande */}
            {/* solo la card que esta mutando muestra el spinner con loadingId */}
            <div className= "flex flex-col gap-3 p-3 overflow-y-auto max-h-[calc(100vh-240px)]">
                {pedidos.length === 0 ? (
                    <p className= "text-body-sm text-secondary text-center py-8 italic">Sin pedidos</p>
                ) : (
                    pedidos.map((pedido) => (
                        <KanbanCard
                            key= {pedido.id}
                            pedido= {pedido}
                            isExpanded= {expandedId === pedido.id}
                            onClick= {()=> onExpand(pedido.id)}
                            onAvanzar = {() => onAvanzar(pedido)}
                            onCancelar = {(motivo)=> onCancelar(pedido, motivo)}
                            onCancelConfirmReset = {onCancelConfirmReset}
                            isCancelConfirm = {cancelConfirmId === pedido.id}
                            isLoading= {loadingId === pedido.id}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

