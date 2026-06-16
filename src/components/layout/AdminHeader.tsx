import { useAuthStore } from "../../store/useAuthStore"
import { useWsStore } from "../../store/wsStore"

/**
 * Barra superior de la pagina autenticada
 * 
 * Muestra nombre, email, roles y el boton para cerrar sesion.
 * Se renderiza dentro de AppLayout en todas las paginas protegidas
 */

interface Props {
    searchPlaceholder?: string
}

export function AdminHeader({searchPlaceholder = "Buscar ... "}: Props) {
    const user = useAuthStore((s)=>s.user)
    const logout = useAuthStore((s)=> s.logout)

    const isConnected = useWsStore((s) => s.isConnected)

    if (!user) return null

    //Mostrar las iniciales de los nombres como logo
    const initials = `${user.nombre[0]}${user.apellido[0]}`.toUpperCase()
    //Mostrar el primer rol
    const rolLabel = user.roles[0]

    return (
        <header className= "h-16 flex items-center justify-between px-lg border-b border-outline-variant bg-surface sticky top-0 z-30">

            {/* Buscador */}
            <div className="flex items-center flex-1 max-w-md">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
                        search
                    </span>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-md focus:outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            {/* Derecha */}
            <div className="flex items-center gap-md">

                {/* Badge WS  */}
                <div className= {`flex items-center gap-1.5 px-3 py-1 rounded-full text-label-sm font-medium border transition-colors
                    ${isConnected
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-surface-container border-outline-variant text-secondary'
                    }`}
                >
                    <span className= {`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-outline-variant'}`} />
                    {isConnected ? 'En tiempo real' : 'Sin conexion WS'}
                </div>
                
                {/* Notificaciones */}
                <button type="button" className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                </button>

                {/* Divisor */}
                <div className="h-8 w-px bg-outline-variant" />

                {/* Usuario */}
                <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-sm font-bold">
                        {initials}
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-label-lg font-semibold text-on-surface">
                            {user.nombre} {user.apellido}
                        </p>
                        <p className="text-label-sm text-secondary">{rolLabel}</p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    type="button"
                    onClick={logout}
                    title="Cerrar sesión"
                    className="p-2 text-secondary hover:bg-error/10 hover:text-error rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                </button>

            </div>
        </header>
    )
}