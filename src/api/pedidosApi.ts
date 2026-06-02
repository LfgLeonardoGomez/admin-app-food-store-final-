import type { IPedidoList, IPedido, ICambioEstadoPayload, IDetallePedidoList } from "../types/IPedido"
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

//Registra una transición de estado en el historial
export const cambiarEstadoPedido = async ( pedidoId: number, payload: ICambioEstadoPayload): Promise<void> => {
  await apiClient.post(`/historialpedidos/${pedidoId}/historial`, payload)
}

export const getDetallesPedido = async (pedidoId: number): Promise <IDetallePedidoList> => {
  const {data} = await apiClient.get<IDetallePedidoList>(`/api/v1/detallepedido/pedido/${pedidoId}`)
  return data
}