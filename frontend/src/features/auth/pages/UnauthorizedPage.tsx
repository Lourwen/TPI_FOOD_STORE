
import { Link } from 'react-router-dom'
import { Button } from '../../../shared/ui/Button'

export function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <h1 className="mb-3 text-4xl font-bold text-red-600">
                403
            </h1>

            <h2 className="mb-2 text-xl font-semibold text-gray-800">
                Acceso no autorizado
            </h2>

            <p className="mb-6 max-w-md text-gray-600">
                No tenés permisos para acceder a esta sección.
            </p>

            <Link to="/productos">
                <Button>Volver al catálogo</Button>
            </Link>
        </div>
    )
}
