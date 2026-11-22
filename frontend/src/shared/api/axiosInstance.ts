
import axios, { type AxiosError } from 'axios'

// Permite que authStore registre la función para limpiar la sesión,
// sin que Axios tenga que importar directamente el store.
type SessionExpiredHandler = () => void

let onSessionExpired: SessionExpiredHandler | null = null

export function setSessionExpiredHandler(handler: SessionExpiredHandler) {
    onSessionExpired = handler
}

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
})

// Intercepta las respuestas de la API.
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status
        const url = error.config?.url ?? ''

        // Estos endpoints gestionan sus propios errores de autenticación.
        const isAuthEndpoint =
            url.includes('/auth/token') || url.includes('/auth/me')

        if (status === 401 && !isAuthEndpoint) {
            onSessionExpired?.()

            if (window.location.pathname !== '/login') {
                window.location.assign('/login')
            }
        }

        return Promise.reject(error)
    },
)
