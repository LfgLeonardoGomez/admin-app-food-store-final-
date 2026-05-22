import { NavLink } from "react-router-dom"
import { useAuthStore} from "../../store/useAuthStore"
import { ROUTES} from "../../router/routes"

/**
 * Barra lateral de navegacion
 * 
 * Muestra los links segun el rol:
 * - ADMIN: ve todos los modulos
 * - STOCK: ve solo Productos
 * - PEDIDOS: ve solo Pedidos
 */

type NavItem = {
    label: string
    to: string
    roles: string[]
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", to: ROUTES.DASHBOARD, roles: ["ADMIN", "STOCK", "PEDIDOS"]},
    { label: "Categorias", to: ROUTES.CATEGORIAS, roles: ["ADMIN"]},
    { label: "Ingredientes", to: ROUTES.INGREDIENTES, roles: ["ADMIN"]},
    { label: "Productos", to: ROUTES.PRODUCTOS, roles: ["ADMIN","STOCK"]},
    { label: "Pedidos", to: ROUTES.PEDIDOS, roles: ["ADMIN","PEDIDOS"]},
]

export function Sidebar(){
    const hasRole = useAuthStore((s) => s.hasRole)

    const itemsVisibles= NAV_ITEMS.filter((item)=>
        item.roles.some((r)=> hasRole(r as any))
    )

    return (
        <aside className="flex h-screen w-56 flex-col border-r border-zinc-200 bg-white px-4 py-6">

            {/* Logo / Nombre */}
            <p className="mb-8 text-lg font-bold text-zinc-900">FoodStore</p>

            {/* Link de navegacion */}
            <nav className="flex flex-col gap-1">
                {itemsVisibles.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                        `rounded-lg px-3 py-2 text-sm font-medium trasnsition-colors ${
                            isActive
                                ? "bg-violes-50 text-violet-700"
                                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        }`
                    }
                >
                    {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}