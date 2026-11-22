import type { Producto } from '../types'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { useCartStore } from '../../../store/cartStore'
import { useState } from 'react'

interface ProductoCardProps {
    producto: Producto
}

export function ProductoCard({ producto }: ProductoCardProps) {
    const agregar = useCartStore((state) => state.agregar)

    const [agregado, setAgregado] = useState(false)

    const disponibleParaCompra =
        producto.activo && producto.disponible && producto.stock > 0

    const handleAgregar = () => {
        agregar({
            producto_id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio_base),
            imagen_url: producto.imagen_url,
        })

        setAgregado(true)

        setTimeout(() => {
            setAgregado(false)
        }, 1500)
    }

    return (
        <Card className="flex flex-col gap-3">
            {producto.imagen_url ? (
                <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="h-40 w-full rounded-md object-cover"
                />
            ) : (
                <div className="flex h-40 items-center justify-center rounded-md bg-gray-100 text-sm text-gray-500">
                    Sin imagen
                </div>
            )}

            <div className="flex flex-1 flex-col gap-2">
                <h2 className="font-semibold text-gray-800">
                    {producto.nombre}
                </h2>

                {producto.descripcion && (
                    <p className="text-sm text-gray-600">
                        {producto.descripcion}
                    </p>
                )}

                <p className="text-lg font-bold text-blue-700">
                    ${Number(producto.precio_base).toFixed(2)}
                </p>

                <p className="text-sm text-gray-500">
                    {producto.stock > 0
                        ? `Stock: ${producto.stock}`
                        : 'Sin stock'}
                </p>

                <Button
                    onClick={handleAgregar}
                    disabled={!disponibleParaCompra}
                    variant={agregado ? 'success' : 'primary'}
                    className="mt-auto w-full"
                >
                    {agregado
                        ? '✓ ¡Agregado al carrito!'
                        : disponibleParaCompra
                            ? 'Agregar al carrito'
                            : 'No disponible'}
                </Button>
            </div>
        </Card>
    )
}