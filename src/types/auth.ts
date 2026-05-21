export type Rol = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT"

export interface AuthUser {
    id: number
    nombre: string
    apellido: string
    email: string
    roles: Rol[]
}

export interface AuthState{
    user: AuthUser | null
    isAuthenticated: boolean
    isLoading : boolean
    error: string | null
    setAuth: (user: AuthUser) => void
    logout: () => Promise<void>
    hasRole: (rol:Rol) => boolean
    checkAuth: () => Promise<void>
    clearSession: () => void
    login: (email: string, password: string) => Promise<void> //Hashear
    setError: (msg: string | null) => void
}