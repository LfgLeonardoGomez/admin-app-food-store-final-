import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "../components/layout/AppLayout"
import { AuthLayout } from "../components/layout/AuthLayout"
import { InitApp } from "../components/InitApp"
import { ProtectedRoute } from "./ProtectedRoutes"
import { ROUTES } from "./routes"
import { LoginPage } from "../modules/auth/pages/LoginPage"
import { CategoriasPage } from "../modules/categorias"
import { IngredientesPage } from "../modules/ingredientes"
import { ProductosPage } from "../modules/productos"
import { PedidosPage, CocineroPage } from "../modules/pedidos"
import { DashboardPage } from "../modules/dashboard"

/**
 * Definicion completa de rutas de la app
 *
 * Estructura:
 * - Rutas publicas envueltas en AuthLayout
 * - Rutas protegidas envueltas en AppLayout con ProtectedRoute
 * - Módulos lazy-loaded para mejorar el tiempo de carga inicial
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

          {/* Rutas protegidas con sidebar */}
          <Route element={<AppLayout />}>

            {/* ADMIN - STOCK - PEDIDOS */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STOCK", "PEDIDOS"]} />}>
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage/>} />
            </Route>

            {/* Solo ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path={ROUTES.CATEGORIAS} element= {<CategoriasPage />} />
              <Route path={ROUTES.INGREDIENTES} element={<IngredientesPage/>} />
            </Route>

            {/* ADMIN - STOCK */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STOCK"]} />}>
              <Route path={ROUTES.PRODUCTOS} element={<ProductosPage/>} />
            </Route>

            {/* ADMIN - PEDIDOS */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "PEDIDOS"]} />}>
              <Route path={ROUTES.PEDIDOS} element={<PedidosPage />} />
            </Route>

            {/* ADMIN - COCINERO */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "COCINERO"]} />}>
              <Route path={ROUTES.COCINA} element={<CocineroPage />} />
            </Route>

          </Route>

          {/* Forbidden */}
          <Route
            path={ROUTES.FORBIDDEN}
            element={
              <div className="flex min-h-screen items-center justify-center">
                <p className="text-secondary text-body-md">No tenés permisos para ver esta página.</p>
              </div>
            }
          />

          {/* Cualquier ruta desconocida redirige al login */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

        </Routes>
      </InitApp>
    </BrowserRouter>
  )
}