import { Outlet } from "react-router-dom"
import { AdminHeader } from "./AdminHeader"
import { Sidebar } from "./Sidebar"

/**
 * Estructura base de las paginas autenticadas
 * 
 * Divide la pantalla en dos columnas:
 * -Izquierda sidebar con navegacion
 * -Derecha header con los datos 
 * 
 * Outlet es donde React router renderiza la pagina hija segun la ruta activa
 * 
 */

export function AppLayout(){
    return (
        <div className="flex min-h-screen bg-zinc-50">

            {/* Columna izquierda - navegacion */}
            <Sidebar />

            {/* Columna derecha - header con contenido */}
            <div className="flex flex-1 flex-col">
                <AdminHeader />
                <main className="flex-1 px-6 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}