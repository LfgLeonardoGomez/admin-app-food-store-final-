import type {Rol} from "./auth"

export interface Usuario {
    id: number
    nombre: string
    apellido: string
    email: string
    celular: string
    //disabled: boolean
    roles: Rol[]
}