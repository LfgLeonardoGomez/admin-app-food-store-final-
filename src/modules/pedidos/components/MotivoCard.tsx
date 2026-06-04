import { useQuery } from "@tanstack/react-query"
import { getHistorialPedido } from "../../../api/pedidosApi"

interface MotivoCardProps {
    pedidoId: number
    isExpanded: boolean
}

export function MotivoCard({ pedidoId, isExpanded }: MotivoCardProps) {
    const { data: historial } = useQuery({
        queryKey: ["historialPedido", pedidoId],
        queryFn: () => getHistorialPedido(pedidoId),
        enabled: isExpanded,
    })

    const motivo = historial?.find(h => h.estado_hacia === "CANCELADO")?.motivo

    return (
        <div className="w-full py-3 px-4 rounded-xl flex flex-col gap-1 bg-error-container text-on-error-container">
            <div className="flex items-center gap-2 text-label-lg">
                <span className="material-symbols-outlined text-[18px] overflow-hidden">cancel</span>
                Pedido cancelado
            </div>
            {motivo && (
                <p className="text-body-sm italic">"{motivo}"</p>
            )}
        </div>
    )
}