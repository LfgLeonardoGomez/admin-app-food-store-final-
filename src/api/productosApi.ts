import type { IProducto, IProductoCreate, IProductoList, IProductoUpdate, IProductoStockUpdate } from "../types/IProducto"
import { apiClient } from "./axiosInstance"

export const getProductos = async (offset= 0, limit= 20):Promise <IProductoList> => {
    const { data } = await apiClient.get<IProductoList>(`/productos/?offset=${offset}&limit=${limit}`)
    return data
}

export const getProductoById = async (id:number): Promise <IProducto> => {
    const {data} = await apiClient.get<IProducto>(`/productos/${id}`)
    return data
}

export const createProducto= async (body: IProductoCreate): Promise <IProducto> => {
    const {data } = await apiClient.post <IProducto> (`/productos/`, body)
    return data
}

export const updateProducto = async (id:number, body: IProductoUpdate): Promise <IProducto> => {
    const {data} = await apiClient.put <IProducto> (`/productos/${id}`, body)
    return data
}

export const deleteProducto = async (id: number): Promise <void> => {
    await apiClient.delete (`/productos/${id}`)
}

export const updateProductoStock = async (id: number, body: IProductoStockUpdate): Promise<IProducto> => {
    const { data } = await apiClient.patch<IProducto>(`/productos/${id}/stock`, body)
    return data
}