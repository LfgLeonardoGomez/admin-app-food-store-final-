import { useEffect, type ReactNode} from "react"
import { Navigate, useNavigate} from "react-router-dom"
import { useAuthStore} from "../../store/useAuthStore"

/**
 * Layout para las paginas publicas
 * 
 * Responsabilidades:
 * - Si el usuario ya esta autenticado redirige al dashboard
 * - Mientras verificaa la sesion muestra un spinner
 * - Si no hay sesion renderiza el contenido hijo en una card centrada
 */

export function AuthLayout({ children}: {children: ReactNode}){
    const user = useAuthStore((s)=> s.user)
    const isLoading = useAuthStore((s)=> s.isLoading)
    const navigate = useNavigate()

    useEffect(()=>{
        if (user) navigate ("/dashboard", {replace:true})

    }, [user, navigate])

    if (isLoading){
        return (
            <div className= "flex min-h-screen items-center justify-center">
                <p className= "text-sm text-zinc-500">Cargando..</p>
            </div>
        )
    }

    if (user) return <Navigate to= "/dashboard" replace />

    return (
        <div className= "flex min-h-screen items-center justify-center px-4 py-12">
            <div className= "w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                {children}
            </div>
        </div>
    )
}