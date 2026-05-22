import "./App.css"
import { BrowserRouter } from "react-router-dom"
import { InitApp } from "./components/InitApp"
import AppRouter from "./router"

/**
 * Raiz de la app
 * 
 * BrowserRouter provee el contexto de navegacion
 * InitApp verifica la sesion activa antes de que el router evalue las rutas
 * 
 */

function App() {
  return (
    <BrowserRouter>
      <InitApp>
        <AppRouter />
      </InitApp>
    </BrowserRouter>
  )
}

export default App