import type { IIngrediente, IIngredienteCreate, IIngredienteList, IIngredienteUpdate } from "../types/IIngrediente"
import { apiClient } from "./axiosInstance"


export const getIngredientes = async (offset = 0, limit = 20): Promise<IIngredienteList> => {
  const { data } = await apiClient.get<IIngredienteList>(`/ingredientes/?offset=${offset}&limit=${limit}`)
  return data
}

export const getIngredienteById = async (id: number): Promise<IIngrediente> => {
  const { data } = await apiClient.get<IIngrediente>(`/ingredientes/${id}`)
  return data
}

export const createIngrediente = async (body: IIngredienteCreate): Promise<IIngrediente> => {
  const { data } = await apiClient.post<IIngrediente>(`/ingredientes/`, body)
  return data
}

export const updateIngrediente = async (id: number, body: IIngredienteUpdate): Promise<IIngrediente> => {
  const { data } = await apiClient.put<IIngrediente>(`/ingredientes/${id}`, body)
  return data
}

export const deleteIngrediente = async (id: number): Promise<void> => {
  await apiClient.delete(`/ingredientes/${id}`)
}