import type { IPedidoList, IPedido, ICambioEstadoPayload, IDetallePedidoList, IHistorialEstado } from "../types/IPedido"
import { apiClient } from "./axiosInstance"

export const getPedidos = async (): Promise<IPedidoList> => {
  const { data } = await apiClient.get<IPedidoList>(`/pedidos/`)
  return data
}

export const getPedidoById = async (id: number): Promise<IPedido> => {
  const { data } = await apiClient.get<IPedido>(`/pedidos/${id}`)
  return data
}

export const getPedidosPorEstado = async (estado: string): Promise<IPedidoList> => {
  const { data } = await apiClient.get<IPedidoList>(`/pedidos/admin/estado/${estado}`)
  return data
}

export const cambiarEstadoPedido = async ( pedidoId: number, payload: ICambioEstadoPayload): Promise<void> => {
  await apiClient.patch(`/pedidos/${pedidoId}/estado`, { 
    nuevo_estado: payload.estado_hacia, 
    motivo: payload.motivo ?? null
  })
}

export const getDetallesPedido = async (pedidoId: number): Promise <IDetallePedidoList> => {
  const {data} = await apiClient.get<IDetallePedidoList>(`/api/v1/detallepedido/pedido/${pedidoId}`)
  return data
}

export const getHistorialPedido = async (pedidoId: number): Promise <IHistorialEstado []> => {
  const {data} = await apiClient.get<IHistorialEstado[]>(`/historialpedidos/${pedidoId}/historial`)
  return data
}