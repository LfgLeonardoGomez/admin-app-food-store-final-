import apiClient from "./axiosInstance";
import type { AuthUser } from "../types/auth";

const AUTH = "/api/v1/auth";


/**
 * Login con OAuth 2 Password Flow. (usa URLSearchParams)
 * 
 * El backend responde con Set-Cookie: access_token=...; HttpOnly; SameSite=Lax
 * El navegador almacena la cookie y la envia autmaticamente en cada request siguiente.
 * El JWT nunca toca el codigo JS.
 * 
 * El campo se llama "username" por la especificacion OAuth2, aunque recibimos el email
 * 
 * Los interceptores de axion manejan automaticamente:
 * - Inclusion de credentials (cookies)
 * - Errores 401 (sesion expirada)
 */

export async function requestLogin (
    email: string, 
    password: string
): Promise<void> {
    const body = new URLSearchParams({ username: email, password });
    await apiClient.post(`${AUTH}/login`, body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
}

/**
 * Rehidrate el estado de autenticacion leyendo el usuario desde el backend
 * 
 * No recibe el token: el navegador lo envia automaticamente via cookie
 * httpOnly. Si la cookie es valida devuelve un 200 con el usuario
 * Si no devuelve un 401, el interceptor de axios limpia la sesion
 */

export async function requestMe(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>(`${AUTH}/me`)
    return response.data;
}

// Le pide al back que invalide la cookie httpOnly
export async function requestLogout(): Promise<void> {
    await apiClient.post(`${AUTH}/logout`)
}