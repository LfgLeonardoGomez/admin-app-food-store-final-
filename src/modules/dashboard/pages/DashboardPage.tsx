import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../../store/useAuthStore"
import { getProductos } from "../../../api/productosApi"
import { getCategorias } from "../../../api/categoriasApi"
import { getPedidosPorEstado } from "../../../api/pedidosApi"
import { StatCard } from "../../../ui/StatCard"
import { PageHeader } from "../../../ui/PageHeader"
import { PedidosEstadoChart } from "../components/PedidosEstadoChart"
import { ProductosChart } from "../components/ProductosChart"

export function DashboardPage() {
    const user = useAuthStore((s) => s.user)
    const isAdmin = useAuthStore((s) => s.hasRole("ADMIN"))
    const isStock = useAuthStore((s) => s.hasRole("STOCK"))
    const isPedidos = useAuthStore((s) => s.hasRole("PEDIDOS"))

    const { data: productos } = useQuery({
        queryKey: ["dashboard-productos"],
        queryFn: () => getProductos(0, 1),
        enabled: isAdmin || isStock,
    })

    const { data: categorias } = useQuery({
        queryKey: ["dashboard-categorias"],
        queryFn: () => getCategorias(),
        enabled: isAdmin,
    })

    const { data: pedidosPendientes } = useQuery({
        queryKey: ["dashboard-pedidos-pendientes"],
        queryFn: () => getPedidosPorEstado("PENDIENTE"),
        enabled: isAdmin || isPedidos,
    })

    return (
        <div className="p-8">
            <PageHeader
                title="Dashboard"
                subtitle={`Bienvenido, ${user?.nombre} ${user?.apellido}`}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                {(isAdmin || isStock) && (
                    <StatCard
                        label="Total Productos"
                        value={productos?.count ?? "—"}
                    />
                )}

                {isAdmin && (
                    <StatCard
                        label="Total Categorías"
                        value={categorias?.data.length ?? "—"}
                    />
                )}

                {(isAdmin || isPedidos) && (
                    <StatCard
                        label="Pedidos Pendientes"
                        value={pedidosPendientes?.count ?? "—"}
                        variant="warning"
                    />
                )}
            </div>

            {/* Seccion de graficos*/}
            {(isAdmin || isPedidos) && (
                <div className= "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    <ProductosChart />
                    <PedidosEstadoChart />
                </div>
            )}
        </div>
    )
}