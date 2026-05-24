import { useEffect, type ReactNode} from "react"
import { Navigate, useNavigate} from "react-router-dom"
import { useAuthStore} from "../../store/useAuthStore"
import { ROUTES } from "../../router/routes"

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
        if (user) navigate (ROUTES.DASHBOARD, {replace:true})

    }, [user, navigate])

    if (isLoading){
        return (
            <div className= "flex min-h-screen items-center justify-center bg-background">
                <span className= "material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span>
            </div>
        )
    }

    if (user) return <Navigate to={ROUTES.DASHBOARD} replace />

    return (
        <div className= "flex min-h-screen items-center justify-center px-md py-xl bg-background">
            <div className= "w-full max-w-md bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow p-xl">
                {children}
            </div>

             <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full" />
            <div className="fixed bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-tertiary/5 blur-[100px] -z-10 rounded-full" />
        </div>
    )
}