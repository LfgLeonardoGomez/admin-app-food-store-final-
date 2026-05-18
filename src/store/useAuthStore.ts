import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// uso esta interface hasta que arme los types de usuario

interface User {
id: number
name: string
email: string
}

interface AuthState {
user: User | null
isAuthenticated: boolean
setAuth: (user: User) => void
logout: () => void
}

export const useAuthStore = create<AuthState>()(
persist(
    (set) => ({
user: null,
isAuthenticated: false,
setAuth: (user) => set({ user, isAuthenticated: true }),
logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' } 
)
)