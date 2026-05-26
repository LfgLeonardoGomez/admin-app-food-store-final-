export interface ICategoria {
  id: number
  nombre: string
  descripcion?: string | null
  imagen_url?: string | null
  categoria_padre_id?: number | null
  created_at: string
  updated_at: string
}

export interface ICategoriaCreate {
  nombre: string
  descripcion?: string | null
  imagen_url?: string | null
  categoria_padre_id?: number | null
}

export interface ICategoriaList {
  data: ICategoria[]
  count: number
}