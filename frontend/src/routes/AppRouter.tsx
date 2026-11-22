
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { UnauthorizedPage } from '../features/auth/pages/UnauthorizedPage'

import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage'

import { CarritoPage } from '../features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage'
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage'
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage'

import { ProtectedRoute } from './ProtectedRoute'
import { MainLayout } from '../shared/layout/MainLayout'

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Rutas privadas para usuarios autenticados */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/productos" element={<CatalogoPage />} />
                        <Route path="/carrito" element={<CarritoPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/mis-pedidos" element={<MisPedidosPage />} />
                    </Route>
                </Route>

                {/* Rutas exclusivas para administradores */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route element={<MainLayout />}>
                        <Route
                            path="/admin/categorias"
                            element={<AdminCategoriasPage />}
                        />
                        <Route
                            path="/admin/productos"
                            element={<AdminProductosPage />}
                        />
                        <Route
                            path="/admin/usuarios"
                            element={<AdminUsuariosPage />}
                        />
                        <Route
                            path="/admin/pedidos"
                            element={<AdminPedidosPage />}
                        />
                        <Route
                            path="/admin/resumen"
                            element={<AdminResumenPage />}
                        />
                    </Route>
                </Route>

                {/* Ruta inicial y rutas inexistentes */}
                <Route path="/" element={<Navigate to="/productos" replace />} />
                <Route path="*" element={<Navigate to="/productos" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

