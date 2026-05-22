import {Routes, Route, Navigate} from 'react-router-dom'
import { ROUTES } from './routes'
import { ProtectedRoute } from "./ProtectedRoutes"
import {LoginPage} from '../modules/auth/pages/LoginPage'

export default function AppRouter() {

    return (
        <Routes>
            {/* Rutas publicas */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Routes>
    )
}