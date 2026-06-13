import {useState} from "react"
import {useNavigate} from "react-router-dom"
import {useAuthStore} from "../../../store/useAuthStore"
import {ROUTES } from "../../../router/routes"

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
            navigate(ROUTES.DASHBOARD)
        } catch {
            //El store capturo y guardo el error
        } finally {
            setIsLoading (false)
        }
    }

    return (
        <div className="space-y-lg">
            <div className="space-y-xs">
                <h1 className="text-headline-lg font-bold text-on-surface">
                    Bienvenido
                </h1>
                <p className= "text-body-md text-on-surface-variant">
                    Ingresá tus credenciales para acceder al panel
                </p>
            </div>                                                      
            <form onSubmit={handleSubmit} className="space-y-md">
                {error && (
                    <div className="flex items-center gap-sm rounded-lg bg-error-container px-md py-sm text-body-md text-on-error-container">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        {error}
                    </div>
                )}

                <div className="space-y-xs">
                    <label className="block text-label-lg font-medium text-on-surface-variant">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange= {(e) => setEmail(e.target.value)}
                        required
                        disabled = {isLoading}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none disabled:bg-surface-container"
                        placeholder="tu@email.com"
                    />
                </div>

                <div className="space-y-xs">
                    <label className="block text-label-lg font-medium text-on-surface-variant">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none disabled:bg-surface-container"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-primary px-md py-sm text-label-lg font-medium text-on-primary hover:bg-primary-container disabled:opacity-50">

                    {isLoading ? (
                        <span className="flex items-center justify-center gap-sm">
                            <span className="material-symbols-outlined animate-spin text-[18px]">
                                progress_activity
                            </span>
                                Iniciando sesión...
                        </span>
                        ) : (
                            "Iniciar sesion"
                        )}
                </button>
            </form>
        </div>
    )
}