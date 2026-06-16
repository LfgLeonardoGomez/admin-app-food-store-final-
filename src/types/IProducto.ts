export interface IProductoIngrediente {
    id: number
    nombre: string
    es_removible: boolean
}

export interface IProducto {
    id: number
    nombre: string
    descripcion?: string | null
    precio_base: string
    imagen_url?: string | null
    stock_cantidad: number
    disponible: boolean
    categorias: { id: number; nombre: string }[]
    ingredientes: IProductoIngrediente[]
}

export interface IProductoCreate {
    nombre: string
    descripcion?: string | null
    precio_base: string
    imagen_url?: string | null
    stock_cantidad: number
    disponible: boolean
    unidad_medida_id?: number | null
}

export interface IProductoUpdate {
    nombre?: string
    descripcion?: string | null
    precio_base?: string
    imagen_url?: string | null
    stock_cantidad?: number
    disponible?: boolean
}

export interface IProductoStockUpdate {
    stock_cantidad?: number
    disponible?: boolean
}

export interface IProductoList {
    data: IProducto []
    count: number
}