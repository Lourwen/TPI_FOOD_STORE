
import { Link } from 'react-router-dom'
import { useCartStore } from '../../../store/cartStore'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

export function CarritoPage() {
    const items = useCartStore((state) => state.items)
    const quitar = useCartStore((state) => state.quitar)
    const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
    const total = useCartStore((state) => state.total)

    if (items.length === 0) {
        return (
            <section className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Mi carrito
                </h1>

                <EstadoVacio mensaje="Tu carrito está vacío." />

                <Link to="/productos" className="self-start">
                    <Button>Volver al catálogo</Button>
                </Link>
            </section>
        )
    }

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Mi carrito
                </h1>
                <p className="mt-1 text-gray-600">
                    Revisá tus productos antes de confirmar la compra.
                </p>
            </div>

            <div className="flex flex-col gap-4">
                {items.map((item) => (
                    <Card key={item.producto_id}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            {item.imagen_url ? (
                                <img
                                    src={item.imagen_url}
                                    alt={item.nombre}
                                    className="h-24 w-24 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500">
                                    Sin imagen
                                </div>
                            )}

                            <div className="flex flex-1 flex-col gap-1">
                                <h2 className="font-semibold text-gray-800">
                                    {item.nombre}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Precio unitario: ${item.precio.toFixed(2)}
                                </p>
                                <p className="font-medium">
                                    Subtotal: ${(item.precio * item.cantidad).toFixed(2)}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="h-9 w-9"
                                    onClick={() =>
                                        cambiarCantidad(item.producto_id, item.cantidad - 1)
                                    }
                                    aria-label={`Disminuir cantidad de ${item.nombre}`}
                                >
                                    -
                                </Button>

                                <span className="min-w-8 text-center">
                  {item.cantidad}
                </span>

                                <Button
                                    variant="outline"
                                    className="h-9 w-9"
                                    onClick={() =>
                                        cambiarCantidad(item.producto_id, item.cantidad + 1)
                                    }
                                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                                >
                                    +
                                </Button>

                                <Button
                                    variant="danger"
                                    className="h-9 w-auto whitespace-nowrap px-3"
                                    onClick={() => quitar(item.producto_id)}
                                >
                                    Quitar
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-xl font-bold">
            ${total().toFixed(2)}
          </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <Link to="/productos">
                        <Button variant="outline">Seguir comprando</Button>
                    </Link>

                    <Link to="/checkout">
                        <Button>Continuar con la compra</Button>
                    </Link>
                </div>
            </Card>
        </section>
    )
}
