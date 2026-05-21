import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import type { Rol } from "../types/auth"

/**
 * Proteccion de rutas por autenticacion y rol
 * 
 * Flujo:
 * 1- Si esta cargando la sesion -> muestra un spinner
 * 2- Si no hay usuarios autenticado -> redirige a /login
 * 3- Si el usuario no tiene el rol requerido -> redirige a /forbidden
 * 4- Si pasa todo -> renderiza la ruta hija con <Outlet />
 */

type Props = {
    allowedRoles: Rol [] //Roles que van a tener acceso 
}

export const PrivateRoute = ({ allowedRoles }: Props) => {
    const { user, hasRole, isLoading } = useAuthStore()

    if (isLoading) {
        return (
            <div className= "flex min-h-screen items-center justify-center">
                <p className= "text-sm text-zinc-500"> Restaurando sesion..</p>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }
    // Si esta autenticado pero sin rol necesario
    if (!allowedRoles.some(rol => hasRole(rol))){
        return <Navigate to= "/forbidden" replace />
    }
    // Si esta autenticado y con el rol renderiza la ruta hija
    return <Outlet />
}