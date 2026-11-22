

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../features/auth/types'
import {
    getCurrentUser,
    loginRequest,
    logoutRequest,
} from '../features/auth/api/auth'
import { setSessionExpiredHandler } from '../shared/api/axiosInstance'
import { useCartStore } from "./cartStore.ts"

interface AuthState {
    usuario: Usuario | null
    cargando: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
    checkSession: () => Promise<void>
    clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            usuario: null,
            cargando: true,

            login: async (username, password) => {
                set({ cargando: true })

                try {
                    await loginRequest({ username, password })
                    const usuario = await getCurrentUser()

                    useCartStore.getState().setUsuario(usuario.id)
                    set({ usuario })
                } finally {
                    set({ cargando: false })
                }
            },

            logout: async () => {
                try {
                    await logoutRequest()
                } finally {
                    useCartStore.getState().setUsuario(null)
                    set({ usuario: null })
                }
            },

            checkSession: async () => {
                set({ cargando: true })

                try {
                    const usuario = await getCurrentUser()

                    useCartStore.getState().setUsuario(usuario.id)
                    set({ usuario })
                } catch {
                    useCartStore.getState().setUsuario(null)
                    set({ usuario: null })
                } finally {
                    set({ cargando: false })
                }
            },

            clearSession: () => {
                useCartStore.getState().setUsuario(null)
                set({ usuario: null })
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                usuario: state.usuario,
            }),
        },
    ),
)

// Conecta el interceptor de Axios con el store,
// sin generar una dependencia circular.
setSessionExpiredHandler(() => {
    useAuthStore.getState().clearSession()
})

