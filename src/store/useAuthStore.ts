import { create } from "zustand"
  import * as authApi from "../api/authApi"
  import type { AuthUser, AuthState, Rol } from "../types/auth"

  export const useAuthStore = create<AuthState>()((set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      setError: (msg: string | null) => set({ error: msg }),

      hasRole: (rol: Rol) => {
          const { user } = get()
          if (!user) return false
          return user.roles.includes(rol)
      },

      clearSession: () =>
          set({ user: null, isAuthenticated: false, isLoading: false, error:
   null }),

      checkAuth: async () => {
          set({ isLoading: true, error: null })
          try {
              const user = await authApi.requestMe()
              set({ user, isAuthenticated: true, isLoading: false })
          } catch {
              set({ user: null, isAuthenticated: false, isLoading: false })
          }
      },

      login: async (email: string, password: string) => {
          set({ isLoading: true, error: null })
          try {
              await authApi.requestLogin(email, password)
              const user = await authApi.requestMe()
              set({ user, isAuthenticated: true, isLoading: false })
          } catch (e) {
              const msg = e instanceof Error ? e.message : "Error de inicio de sesión"
              set({ user: null, isAuthenticated: false, isLoading: false,
  error: msg })
              throw e
          }
      },

      logout: async () => {
          try {
              await authApi.requestLogout()
          } catch {
              // si falla la red igual limpiamos el estado local
          }
          set({ user: null, isAuthenticated: false, error: null, isLoading:
  false })
      },

      setAuth: (user: AuthUser) => set({ user, isAuthenticated: true }),
  }))
