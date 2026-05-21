import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useAuthStore} from "../../../store/useAuthStore"

/**
 * Pagina de inicio de sesion del panel de administracion
 * 
 * Flujo:
 * 1- El usuario ingresa email y password y envia el formulario.
 * 2- Se llama a login() del store, que hace POST /auth/token (OAuth2 form-urlencoded)
 * 3- El backend setea la cookie httpOnly con el JWT
 * 4- Se llama a requestMe() internamente para cargar el usuario en el store
 * 5- Si todo sale bien -> navega al dashboard
 * 6- Si falla -> el store guarda el error y se muestra en pantalla
 * 
 */

export function LoginPage(){
    const navigate = useNavigate()

    
}