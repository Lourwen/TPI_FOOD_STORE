
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
    allowedRoles?: ('user' | 'admin')[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const usuario = useAuthStore((state) => state.usuario)
    const cargando = useAuthStore((state) => state.cargando)

    if (cargando) {
        return <p>Verificando sesión...</p>
    }

    if (!usuario) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && !allowedRoles.includes(usuario.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}
