import type { ICategoria, ICategoriaCreate, ICategoriaList } from "../types/ICategoria"
import { apiClient } from "./axiosInstance"

export const getCategorias = async (offset = 0, limit = 20): Promise<ICategoriaList> => {
  const { data } = await apiClient.get<ICategoriaList>(`/categorias/?offset=${offset}&limit=${limit}`)
  return data
}

export const getCategoriaById = async (id: number): Promise<ICategoria> => {
  const { data } = await apiClient.get<ICategoria>(`/categorias/${id}`)
  return data
}

export const createCategoria = async (body: ICategoriaCreate): Promise<ICategoria> => {
  const { data } = await apiClient.post<ICategoria>(`/categorias/`, body)
  return data
}

export const updateCategoria = async (id: number, body: Partial<ICategoriaCreate>): Promise<ICategoria> => {
  const { data } = await apiClient.patch<ICategoria>(`/categorias/${id}`, body)
  return data
}

export const deleteCategoria = async (id:number): Promise<void> => {
  await apiClient.delete(`/categorias/${id}`)
}