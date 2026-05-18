import {Routes, Route, Navigate} from 'react-router-dom'

import { ROUTES } from './routes'

import Login from '../features/auth/pages/login'

export default function AppRouter() {

    return (
        <Routes>
            <Route path={ROUTES.LOGIN} element={<Login />} />
        </Routes>
    )
}