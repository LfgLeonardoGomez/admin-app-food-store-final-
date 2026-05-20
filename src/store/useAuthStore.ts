import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthUser, AuthState, Rol } from "../types/auth"

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get): AuthState => ({
            user: null,
            isAuthenticated: false,
            setAuth: (user: AuthUser) => set ({user, isAuthenticated: true }),
            logout: ()=> {set({ user: null, isAuthenticated: false}) },
            hasRole: (rol: Rol) => get().user?.roles.includes(rol) ?? false,    
        }),
        {name : "auth-storage"}
    )
)