import { useQuery } from "@tanstack/react-query"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { getPedidos } from "../../../api/pedidosApi"
import { ESTADO_LABELS, type EstadoPedido } from "../../../types/IPedido"

/**
 * Para el grafico de dona se necesita:
 * - ArcElement: los arcos/porciones
 * - Tooltip: el popover al pasar el mouse
 * - Legend: la leyenda con lso colroes y nombres de cada estado
 */
ChartJS.register(ArcElement, Tooltip, Legend)

//Mapea cada estado con un color fijo, con el record para que TypeScript
// nos oblige a tener exactamente un color para cada estado
// Si se agrega uno nuevo y nos olvidamos el color, compila con error.
const COLORES: Record<EstadoPedido, string> = {
    PENDIENTE:  "#f59e0b",
    CONFIRMADO: "#3b82f6",
    EN_PREP:    "#8b5cf6",
    LISTO:      "#10b981",
    ENTREGADO:  "#27ae60",
    CANCELADO:  "#ef4444",
}

export function PedidosEstadoChart() {

    //Una query trae todos los pedidos. Comparte el queryKey con ProductosChart
    // asi si ambos componentes estan montados, TanStack hace una sola llamada
    // reutiliza el resultado en cache para los dos
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-pedidos-all"],
        queryFn: getPedidos,
    })

    if (isLoading || !data) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm h-72 flex items-center justify-center text-gray-400">
                Cargando...
            </div>
        )
    }

    // Object sobre ESTADO_LABELS nos da los estados en el orden definido
    // Para cada estado contamos cuantos pedidos tienen ese estado_codigo
    // Filtramos los que tienen count 0 paran o mostrar porciones vacias
    const estados = Object.keys(ESTADO_LABELS) as EstadoPedido[]
    const conDatos = estados
        .map(e => ({ estado: e, count: data.data.filter(p => p.estado_codigo === e).length }))
        .filter(x => x.count > 0)

    if (conDatos.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm h-72 flex items-center justify-center text-gray-400">
                Sin pedidos
            </div>
        )
    }

    //EL orden de labels, data y backgroundColor tienen que ser el mismo array
    // El indice 0 de labels corresponde al indice 0 de data y al indice 0 de background
    const chartData = {
        labels: conDatos.map(x => ESTADO_LABELS[x.estado]),
        datasets: [{
            data: conDatos.map(x => x.count),
            backgroundColor: conDatos.map(x => COLORES[x.estado]),
            borderWidth: 0,
        }],
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Pedidos por estado</h3>
            <div className="flex justify-center">
                <div style={{ width: 220, height: 220 }}>
                    <Doughnut
                        data={chartData}
                        options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom" } },
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
