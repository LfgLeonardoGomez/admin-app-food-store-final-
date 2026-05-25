export interface IProducto {
    id: number
    nombre: string
    descripcion?: string | null
    precio_base: string
    imagen_url?: string | null
    stock_cantidad: number
    disponible: boolean
    categorias: { id: number; nombre: string }[]
    ingredientes: { id: number; nombre: string }[]
}

export interface IProductoCreate {
    nombre: string
    descripcion?: string | null
    precio_base: string
    imagen_url?: string | null
    stock_cantidad: number
    disponible: boolean
}

export interface IProductoUpdate {
    nombre?: string
    descripcion?: string | null
    precio_base?: string
    imagen_url?: string | null
    stock_cantidad?: number
    disponible?: boolean
}

export interface IProductoList {
    data: IProducto []
    count: number
}