export type Rol = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT"

export interface AuthUser {
    id: number
    nombre: string
    apellido: string
    email: string
    roles: Rol[]
}

export interface Usuario {
    id: number
    nombre: string
    apellido: string
    email: string
    celular: string
    //disabled: boolean
    roles: Rol[]
}

export interface AuthState{
    user: AuthUser | null
    isAuthenticated: boolean
    setAuth: (user: AuthUser) => void
    logout: () => void
    hasRole: (rol:Rol) => boolean
}