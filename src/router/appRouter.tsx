import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"
import { AppLayout } from "../components/layout/AppLayout"
import { AuthLayout } from "../components/layout/AuthLayout"
import { InitApp } from "../components/InitApp"
import { ProtectedRoute } from "./ProtectedRoutes"
import { ROUTES } from "./routes"
import { LoginPage } from "../modules/auth/pages/LoginPage"

const CategoriasPage = lazy(() =>
  import("../modules/categorias").then((m) => ({ default: m.CategoriasPage }))
)

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
              <Route path={ROUTES.DASHBOARD} element={<div>Dashboard</div>} />
            </Route>

            {/* Solo ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route
                path={ROUTES.CATEGORIAS}
                element={
                  <Suspense fallback={null}>
                    <CategoriasPage />
                  </Suspense>
                }
              />
              <Route path={ROUTES.INGREDIENTES} element={<div>Ingredientes</div>} />
            </Route>

            {/* ADMIN - STOCK */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "STOCK"]} />}>
              <Route path={ROUTES.PRODUCTOS} element={<div>Productos</div>} />
            </Route>

            {/* ADMIN - PEDIDOS */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "PEDIDOS"]} />}>
              <Route path={ROUTES.PEDIDOS} element={<div>Pedidos</div>} />
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