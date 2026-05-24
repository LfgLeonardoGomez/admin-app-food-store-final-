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
        <div className="flex h-screen bg-background">

            {/* Columna izquierda - navegacion */}
            <Sidebar />

            {/* Columna derecha - header con contenido */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto p-xl">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}