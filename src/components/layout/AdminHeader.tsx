import { useAuthStore } from "../../store/useAuthStore"

/**
 * Barra superior de la pagina autenticada
 * 
 * Muestra nombre, email, roles y el boton para cerrar sesion.
 * Se renderiza dentro de AppLayout en todas las paginas protegidas
 */

export function AdminHeader() {
    const user = useAuthStore((s)=>s.user)
    const logout = useAuthStore((s)=> s.logout)

    if (!user) return null

    return (
        <header className= "flex items-center justify-between gap-4 px-6 py-4 border-b border-zinc-200 bg-white">

            {/* Datos del ususario */}
            <div>
                <p className="text-sm font-semibold text-zinc-900">
                    {user.nombre} {user.apellido}
                </p>
                <p className= "text-xs text-zinc-500">
                    {user.email} .{" "}
                    {user.roles.map((r) => (
                        <span key={r} className= "font-medium text-violet-600">
                            {r}{" "}
                        </span>
                    ))}
                </p>
            </div>

            {/* Boton logout */}
            <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
                    Cerrar sesion
                </button>
        </header>
    )
}