import type { IPedidoList, IPedido, ICambioEstadoPayload, IDetallePedidoList, IHistorialEstado } from "../types/IPedido"
import { apiClient } from "./axiosInstance"

export const getPedidos = async (): Promise<IPedidoList> => {
  const { data } = await apiClient.get<IPedidoList>(`/api/v1/pedidos/`)
  return data
}

export const getPedidoById = async (id: number): Promise<IPedido> => {
  const { data } = await apiClient.get<IPedido>(`/api/v1/pedidos/${id}`)
  return data
}

export const getPedidosPorEstado = async (estado: string): Promise<IPedidoList> => {
  const { data } = await apiClient.get<IPedidoList>(`/api/v1/pedidos/admin/estado/${estado}`)
  return data
}

export const cambiarEstadoPedido = async ( pedidoId: number, payload: ICambioEstadoPayload): Promise<void> => {
  await apiClient.patch(`/api/v1/pedidos/${pedidoId}/estado`, {
    nuevo_estado: payload.estado_hacia,
    motivo: payload.motivo ?? null
  })
}

export const getDetallesPedido = async (pedidoId: number): Promise <IDetallePedidoList> => {
  const {data} = await apiClient.get<IDetallePedidoList>(`/api/v1/detallepedido/pedido/${pedidoId}`)
  return data
}

export const getHistorialPedido = async (pedidoId: number): Promise <IHistorialEstado []> => {
  const {data} = await apiClient.get<IHistorialEstado[]>(`/api/v1/pedidos/${pedidoId}/historial`)
  return data
}