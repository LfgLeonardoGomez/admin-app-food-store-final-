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

    //Solo re-renderiza si cambian estos valores
    const login = useAuthStore((s) => s.login)
    const error = useAuthStore((s)=> s.error)
    const setError = useAuthStore((s) => s.setError)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try{
            await login(email,password)
            navigate("/dashboard")
        } catch {
            //El store capturo y guardo el error
        } finally {
            setIsLoading (false)
        }
    }

    return (
        <div className= "space-y-6">
            <h1 className= "text-3xl font-bold">Iniciar Sesion</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className= "rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none disabled:bg-zinc-100"
                        placeholder="Tu email"
                        />
                </div>
                <div>
                    <label className="block text-sm font-medium text-zinc-700">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none disabled:bg-zinc-100"
                        placeholder="Tu contraseña"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                        {isLoading ? "Iniciando sesion..." : "Iniciar sesion"}
                    </button>
            </form>
        </div>
    )

}