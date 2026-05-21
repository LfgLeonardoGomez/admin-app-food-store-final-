import { getApiBase } from "./config"
import axios, {type AxiosError, type AxiosResponse } from "axios"
import { useAuthStore } from "../store/useAuthStore"

/**
 * Cliente HTTP usando Axios
 *
 * Características:
 * - Base URL configurada desde .env
 * - Credentials incluidas (cookies httpOnly)
 * - Interceptores para request y response
 * - Manejo automático de errores 401
 */

export const apiClient = axios.create({
    baseURL: getApiBase(),
    withCredentials: true, //Incluye cookies httpOnly
    timeout: 10000, //10 segundos
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
})

/* INTERCEPTOR DE REQUEST */
apiClient.interceptors.request.use(
    (config) => {

        return config;
    },
    (error: AxiosError) => {
        console.error("Error en request:", error);
        return Promise.reject(error);
    },
);

/* INTERCEPTOR DE RESPONSE */
apiClient.interceptors.response.use(
    (response:AxiosResponse) => {
        //Si es exitosa pasa normalmente
        return response;
    },
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            //Si expira el TOkEN
            console.warn("Sesion expirada (401), limpiando...");
           useAuthStore.getState().clearSession();
        }
        return Promise.reject(error);
    },
);
//Alias de compatibilidad
export default apiClient;