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
    icon: string
}

const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", to: ROUTES.DASHBOARD, roles: ["ADMIN", "STOCK", "PEDIDOS"], icon: "grid_view"},
    { label: "Categorias", to: ROUTES.CATEGORIAS, roles: ["ADMIN"], icon: "category"},
    { label: "Ingredientes", to: ROUTES.INGREDIENTES, roles: ["ADMIN"], icon: "inventory_2"},
    { label: "Productos", to: ROUTES.PRODUCTOS, roles: ["ADMIN","STOCK"], icon: "local_pizza"},
    { label: "Pedidos", to: ROUTES.PEDIDOS, roles: ["ADMIN","PEDIDOS"], icon: "shopping_cart"},
    { label: "Cocina", to: ROUTES.COCINA, roles: ["ADMIN","COCINERO"], icon: "soup_kitchen"},
]

export function Sidebar(){
    const hasRole = useAuthStore((s) => s.hasRole)
    const isLoading = useAuthStore((s) => s.isLoading)

    const itemsVisibles= NAV_ITEMS.filter((item)=>
        item.roles.some((r)=> hasRole(r as any))
    )

    return (
        <aside className="flex h-screen w-48 flex-col border-r border-outline-variant bg-surface px-md gap-sm">

            {/* Logo / Nombre */}
            <div className= "flex items-center gap-sm mb-lg px-xs mt-lg">
                <div className= "w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
                    <span className="material-symbols-outlined">local_pizza</span>
                </div>
            </div>
            <div>
                <h1 className="text-headline-md font-semibold text-primary">FoodStore</h1>
                <p className="text-label-sm font-bold text-secondary">Admin Portal</p>
            </div>

            {/* Link de navegacion */}
            <nav className="flex flex-col gap-xs flex-1">
                {isLoading ? (
                    <>
                        {[1, 2, 3]. map((i) => (
                            <div
                                key={i}
                                className="h-10 rounded-lg bg-surface-container-low animate-pulse"
                            />
                        ))}
                    </>
                ) : (
                     itemsVisibles.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                            `flex items-center gap-md p-md rounded-lg transition-all text-label-lg ${
                                isActive
                                    ? "bg-secondary-container text-on-secondary-container font-bold"
                                    : "text-secondary hover:bg-surface-container-low font-semibold"
                                }`
                            }
                        >
                            <span className= "material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                     ))
                )}
            </nav>
        </aside>
    )
}