import { useEffect, type ReactNode } from "react"
import { useAuthStore } from "../store/useAuthStore"

/**
 * InitApp - Componente que inicializa la autenticacion
 * Se ejecuta una sola vez cuando la app carga
 * Llama checkAuth() que verifica la cookie y restaura
 * la sesion si es valida.
 */

export function InitApp({ children }: {children: ReactNode}) {
    const checkAuth = useAuthStore((s) => s.checkAuth)

    useEffect(()=> {
        checkAuth()
    }, [checkAuth])

    return <>{children}</>
}