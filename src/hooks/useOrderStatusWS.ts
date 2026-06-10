import { useEffect, useRef, useCallback } from "react"
import { getApiBase } from "../api/config"
import { useAuthStore } from "../store/useAuthStore"
import { useWsStore } from "../store/wsStore"

const WS_URL = `${getApiBase().replace(/^http/, "ws")}/pedidos/cocina/ws`

export interface IWsEvent {
    event:
        | "NUEVO_PEDIDO"
        | "PEDIDO_CONFIRMADO"
        | "PEDIDO_EN_PREPARACION"
        | "PEDIDO_LISTO"
        | "PEDIDO_CANCELADO"
        | "PEDIDO_ENTREGADO"
        | "SUBSCRIBED"
        | "ERROR"
        | "WS_CONNECTED"
    data: unknown
}

interface IUseWebSocketOptions {
    onMessage?: (msg: IWsEvent) => void
    enabled?: boolean
}

/** Conexion WebSocket persistente con el backend (cookie httpOnly viaja sola en el handshake)
 *  Reconecta con backoff exponencial salvo en cierre normal
 *  (1000) o auth rechazada (1008). Emite "WS_CONNECTED" sintetico al abrir
 *  para que la pagina sincronice datos / re-suscripciones
 */

export function useOrderStatusWS ({ onMessage, enabled = true} : IUseWebSocketOptions = {}){
    const wsRef = useRef <WebSocket | null > (null)
    const onMessageRef = useRef (onMessage)

    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

    useEffect( () => {
        if (!enabled) return

        let cancelled = false
        let retryCount = 0
        let retryTimer: ReturnType <typeof setTimeout> | null = null
        let currentWs: WebSocket | null = null

        const closeCleanly = (ws: WebSocket) => {
            if (ws.readyState === WebSocket.CONNECTING) {
                ws.addEventListener("open", ()=> ws.close(1000), { once: true})
            } else if (ws.readyState === WebSocket.OPEN) {
                ws.close(1000)
            }
        }

        const connect = () => {
            if (cancelled) return
            
            const ws = new WebSocket(WS_URL)
            currentWs = ws
            wsRef.current = ws

            ws.onopen = () => {
                
                if (cancelled) {
                    ws.close(1000)
                    return
                }
                retryCount = 0
                onMessageRef.current?.({ event: "WS_CONNECTED", data: null})

                useWsStore.getState().connect()
            }

            ws.onmessage = (event) => {
                if (cancelled) return
                try {
                    const msg = JSON.parse(event.data as string) as IWsEvent 
                    onMessageRef.current?.(msg)
                } catch {
                    // Mensaje malformado - se ignora
                }
            }

            ws.onerror = ()=> {
                //todo error ws dispara onclose despues, la logica vive ahi
            }

            ws.onclose = async (e) => {
                
                if (wsRef.current === ws) wsRef.current = null
                currentWs = null

                useWsStore.getState().disconnect()

                const cierreNormal = e.code === 1000
                const tokenExpirado = e.code === 1008

                if (cancelled || cierreNormal) return

                if (tokenExpirado) {
                    try{
                        await useAuthStore.getState().checkAuth()
                        //sesion renovada - reconectar inmediatamente
                        if (!cancelled) connect()
                    } catch {
                        // sesion invalida - no reconectar, el router redirije
                    }
                    return
                }

                retryCount++
                const delay = Math.min (1000 *2 ** retryCount, 30_000)
                retryTimer = setTimeout(connect, delay)
            }
        }

        connect()

        return () => {
            cancelled = true
            if (retryTimer !== null) clearTimeout(retryTimer)
            if (currentWs) closeCleanly(currentWs)
            wsRef.current = null
        }
    }, [enabled])

    const subscribeToOrder = useCallback ( (orderId: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ action: "subscribe-order", order_id: orderId}))
        }
    }, [])

    const unsubscribeFromOrder = useCallback ( (orderId: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify( { action: "unsubscribe-order", order_id: orderId}))
        }
    }, [])

    const isConnected = useWsStore((s) => s.isConnected)
    return { subscribeToOrder, unsubscribeFromOrder, isConnected}
}