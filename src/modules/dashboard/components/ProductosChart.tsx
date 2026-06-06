import { useQuery, useQueries } from "@tanstack/react-query"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js"
import { getPedidos, getDetallesPedido } from "../../../api/pedidosApi"

/** 
 * Chart.js funciona con un sistema de registro - solo se incluyen los modulos que usamos
 * Grafico de barras
 * - CategoryScale: eje x con categorias (nombres de productos)
 * - LinearScale: eje y con numeros
 * - BarElement: las barras en si
 * - Tooltip: el popover al pasar el mouse
 * - Legend: la leyenda (la ocultamos pero se registra)
*/
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export function ProductosChart() {

    //Traemos todos los pedidos para obtener sus IDs
    const { data: pedidosData, isLoading: loadingPedidos } = useQuery({
        queryKey: ["dashboard-pedidos-all"],
        queryFn: getPedidos,
    })
    // Extrae solo los IDs. Si no llegaron se usa un array vacio
    const pedidoIds = pedidosData?.data.map(p => p.id) ?? []

    // useQueries ejecuta queries en paralelo, una por cada pedido
    // trae los detalles (productos) de un pedido especifico
    const detallesQueries = useQueries({
        queries: pedidoIds.map(id => ({
            queryKey: ["dashboard-detalles", id],
            queryFn: () => getDetallesPedido(id),
        })),
    })

    const isLoading = loadingPedidos || detallesQueries.some(q => q.isLoading)

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm h-72 flex items-center justify-center text-gray-400">
                Cargando...
            </div>
        )
    }

    // Agregacion, recorre todos los detalles y acumulamos la cantidad vendida por producto
    const conteo: Record<string, number> = {}
    for (const q of detallesQueries) {
        if (!q.data) continue
        for (const d of q.data.data) {
            conteo[d.nombre_snapshot] = (conteo[d.nombre_snapshot] ?? 0) + d.cantidad
        }
    }

    // Convertimos el objeto a array, ordenandolo de mayor a menor contando solo los primero 5
    const top5 = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    if (top5.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm h-72 flex items-center justify-center text-gray-400">
                Sin datos
            </div>
        )
    }

    // Espera los datos en este formato:
    // labels: array con los nombres que aparecen en los ejes
    // datasets: array de series de datos
    const chartData = {
        labels: top5.map(([nombre]) => nombre),
        datasets: [{
            label: "Unidades vendidas",
            data: top5.map(([, count]) => count),
            backgroundColor: "#3b82f6",
            borderRadius: 6,
        }],
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 5 productos más vendidos</h3>
            <div style={{ height: 220 }}>
                <Bar
                    data={chartData}
                    options={{
                        indexAxis: "y", //Grafico horizontal
                        maintainAspectRatio: false, //Respeta el alto del contenedor
                        plugins: { legend: { display: false } }, //oculta la leyenda
                        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }, //Numeros enteros
                    }}
                />
            </div>
        </div>
    )
}