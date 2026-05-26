export type EstadoPedido =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREP"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO"

//Record <K , V> donde k son las claves permitidas y V el tipo de valor de cada clave
//El record obliga a que exista exactamente una entrada
// por cada valor del union type EstadoPedido. Si falta alguna clave da error
export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  PENDIENTE:  "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREP:    "En preparación",
  EN_CAMINO:  "En camino",
  ENTREGADO:  "Entregado",
  CANCELADO:  "Cancelado",
}

// Define que transiciones son validas desde cada estado
// las terminales no admiten mas cambios (Entregado y cancelado)
export const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE:  ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: ["EN_PREP",    "CANCELADO"],
  EN_PREP:    ["EN_CAMINO",  "CANCELADO"],
  EN_CAMINO:  ["ENTREGADO"],
  ENTREGADO:  [],
  CANCELADO:  [],
}

export interface IPedido {
  id: number
  usuario_id: number
  estado_codigo: EstadoPedido
  direccion_id: number
  forma_pago_codigo: string
  descuento: string
  notas?: string | null
  subtotal: string
  costo_envio: string
  total: string
}

export interface IPedidoList {
  data: IPedido[]
  count: number
}

export interface ICambioEstadoPayload {
  estado_hacia: EstadoPedido
  motivo?: string | null
}
