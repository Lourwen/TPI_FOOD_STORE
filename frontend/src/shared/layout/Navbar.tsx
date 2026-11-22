
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

export function Navbar() {
    const usuario = useAuthStore((state) => state.usuario)
    const logout = useAuthStore((state) => state.logout)
    const cantidadItems = useCartStore((state) =>
        state.items.reduce((total, item) => total + item.cantidad, 0),
    )
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <header className="border-b border-gray-200 bg-white shadow-sm">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
                <Link to="/" className="text-xl font-bold text-blue-700">
                    Food Store
                </Link>

                <div className="flex flex-wrap items-center gap-4">
                    {usuario && (
                        <>
                            <Link to="/productos" className="text-sm hover:text-blue-600">
                                Catálogo
                            </Link>

                            <Link to="/mis-pedidos" className="text-sm hover:text-blue-600">
                                Mis pedidos
                            </Link>

                            {usuario.role === 'admin' && (
                                <>
                                    <Link to="/admin/productos" className="text-sm hover:text-blue-600">
                                        Productos
                                    </Link>
                                    <Link to="/admin/categorias" className="text-sm hover:text-blue-600">
                                        Categorías
                                    </Link>
                                    <Link to="/admin/usuarios" className="text-sm hover:text-blue-600">
                                        Usuarios
                                    </Link>
                                    <Link to="/admin/pedidos" className="text-sm hover:text-blue-600">
                                        Pedidos
                                    </Link>
                                    <Link to="/admin/resumen" className="text-sm hover:text-blue-600">
                                        Resumen
                                    </Link>
                                </>
                            )}

                            <Link to="/carrito" className="text-sm hover:text-blue-600">
                                Carrito ({cantidadItems})
                            </Link>

                            <span className="text-sm text-gray-600">
                {usuario.full_name}
              </span>

                            <Button variant="outline" onClick={handleLogout}>
                                Cerrar sesión
                            </Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
