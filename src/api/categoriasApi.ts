import type { ICategoria, ICategoriaCreate, ICategoriaList } from "../types/ICategoria"
import { apiClient } from "./axiosInstance"

export const getCategorias = async (offset = 0, limit = 20): Promise<ICategoriaList> => {
  const { data } = await apiClient.get<ICategoriaList>(`/api/v1/categorias/?offset=${offset}&limit=${limit}`)
  return data
}

export const getCategoriaById = async (id: number): Promise<ICategoria> => {
  const { data } = await apiClient.get<ICategoria>(`/api/v1/categorias/${id}`)
  return data
}

export const createCategoria = async (body: ICategoriaCreate): Promise<ICategoria> => {
  const { data } = await apiClient.post<ICategoria>(`/api/v1/categorias/`, body)
  return data
}

export const updateCategoria = async (id: number, body: Partial<ICategoriaCreate>): Promise<ICategoria> => {
  const { data } = await apiClient.put<ICategoria>(`/api/v1/categorias/${id}`, body)
  return data
}

export const deleteCategoria = async (id:number): Promise<void> => {
  await apiClient.delete(`/api/v1/categorias/${id}`)
}