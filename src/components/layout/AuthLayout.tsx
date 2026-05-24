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
        <div className="flex min-h-screen items-center justify-center px-4 py-8 bg-background">
            <div className="w-full max-w-[28rem] flex flex-col items-center gap-6">

                {/* Branding */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
                        <span className="material-symbols-outlined text-on-primary text-[36px]">
                            local_pizza
                        </span>
                    </div>
                    <h2 className="text-headline-lg font-bold text-primary">FoodStore</h2>
                    <p className="text-body-md text-on-surface-variant">Gestión de Operaciones</p>
                </div>

                {/* Card */}
                <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant ambient-shadow p-8">
                    {children}
                </div>

            </div>

            <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full" />
            <div className="fixed bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-tertiary/5 blur-[100px] -z-10 rounded-full" />
        </div>
    )
}