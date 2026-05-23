import {BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { AuthLayout } from "../components/layout/AuthLayout"
import { InitApp } from "../components/InitApp"
import { ProtectedRoute } from "./ProtectedRoutes"
import { ROUTES } from "./routes"
import { LoginPage } from "../modules/auth/pages/LoginPage"

/**
 * Definicion completa de rutas de la app
 * 
 * Estructura:
 * - Rutas publicas envueltas en AuthLayout
 * - Rutas protegidas envueltas en AppLayout con ProtectedRoute
 */

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <InitApp>
                <Routes>

                    {/* Rutas publicas */}
                    <Route
                        path={ROUTES.LOGIN}
                        element={
                            <AuthLayout>
                                <LoginPage />
                            </AuthLayout>
                        }
                    />

                    {/*Rutas Protegidas con sidebar*/}
                    <Route element={<AppLayout />}>

                        {/* ADMIN - STOCK - PEDIDOS */}
                        <Route 
                            element={<ProtectedRoute 
                            allowedRoles={["ADMIN","STOCK","PEDIDOS"]} />}>
                        </Route>

                        {/*Solo ADMIN*/}
                        <Route
                            element={<ProtectedRoute allowedRoles ={["ADMIN"]} />}>
                            <Route path = {ROUTES.CATEGORIAS}
                                element={<div>Categorias</div>} />
                            <Route path = {ROUTES.INGREDIENTES}
                                element={<div>Ingredientes</div>} />
                        </Route>

                        {/* ADMIN - STOCK */}
                        <Route 
                            element={<ProtectedRoute allowedRoles={["ADMIN","STOCK"]} />}>
                            <Route path ={ROUTES.PRODUCTOS}
                                element= {<div>Productos</div>} />
                        </Route>

                        {/* ADMIN - PEDIDOS */}
                        <Route 
                            element={<ProtectedRoute allowedRoles={["ADMIN", "PEDIDOS"]} />}>
                            <Route path = {ROUTES.PEDIDOS}
                                element={<div>Pedidos</div>} />
                        </Route>                    
                    </Route>

                    {/* Forbidden */}
                    <Route
                        path= {ROUTES.FORBIDDEN}
                        element= {
                            <div className= "flex min-h-screen items-center justify-center">
                                <p className= "text-zinc-500"> No tenes persmisos para ver esta pagina</p>
                            </div>
                        }
                    />

                    {/* Cualquier ruta desconocida redirige al login */}
                    <Route
                        path="*"
                        element={<Navigate to={ROUTES.LOGIN} replace />}
                    />
                </Routes>
            </InitApp>
        </BrowserRouter>
    )
}