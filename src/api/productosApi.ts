import type { IProducto, IProductoCreate, IProductoList, IProductoUpdate, IProductoStockUpdate } from "../types/IProducto"
import { apiClient } from "./axiosInstance"

export const getProductos = async (offset= 0, limit= 20):Promise <IProductoList> => {
    const { data } = await apiClient.get<IProductoList>(`/api/v1/productos/?offset=${offset}&limit=${limit}`)
    return data
}

export const getProductoById = async (id:number): Promise <IProducto> => {
    const {data} = await apiClient.get<IProducto>(`/api/v1/productos/${id}`)
    return data
}

export const createProducto= async (body: IProductoCreate): Promise <IProducto> => {
    const {data } = await apiClient.post <IProducto> (`/api/v1/productos/`, body)
    return data
}

export const updateProducto = async (id:number, body: IProductoUpdate): Promise <IProducto> => {
    const {data} = await apiClient.put <IProducto> (`/api/v1/productos/${id}`, body)
    return data
}

export const deleteProducto = async (id: number): Promise <void> => {
    await apiClient.delete (`/api/v1/productos/${id}`)
}

export const updateProductoStock = async (id: number, body: IProductoStockUpdate): Promise<IProducto> => {
    const { data } = await apiClient.patch<IProducto>(`/api/v1/productos/${id}/disponibilidad`, body)
    return data
}

export const updateProductoCategorias = async (id:number, categorias: number[]): Promise <void> => {
    await apiClient.put(`/api/v1/productos/${id}/categorias`, {categorias})
}

export const updateProductoIngredientes = async (
    id: number,
    ingredientes: number[]
): Promise<void> => {
    await apiClient.put(`/api/v1/productos/${id}/ingredientes`, { ingredientes })
}