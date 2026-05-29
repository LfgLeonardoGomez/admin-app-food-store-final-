export interface IIngrediente {
  id: number
  nombre: string
  descripcion?: string | null
  es_alergeno: boolean
  disponible: boolean
}

export interface IIngredienteCreate {
  nombre: string
  descripcion?: string | null
  es_alergeno: boolean
  disponible: boolean
}

export interface IIngredienteUpdate {
  nombre?: string
  descripcion?: string | null
  es_alergeno?: boolean
  disponible?: boolean
}

export interface IIngredienteList {
  data: IIngrediente[]
  count: number
}