
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useMisPedidos } from '../hooks/usePedidos'
import { useCancelarPedido } from '../hooks/useCancelarPedido'


import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

export function MisPedidosPage() {
    const [pagina, setPagina] = useState(1)
    const [errorAccion, setErrorAccion] = useState('')

    const limite = 10

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useMisPedidos({
        skip: (pagina - 1) * limite,
        limit: limite,
    })

    const cancelar = useCancelarPedido()

    const handleCancelar = async (pedidoId: number) => {
        const confirmar = window.confirm(
            '¿Estás seguro de que querés cancelar este pedido?',
        )

        if (!confirmar) return

        setErrorAccion('')

        try {
            await cancelar.mutateAsync(pedidoId)
        } catch (error) {
            setErrorAccion(handleApiError(error))
        }
    }

    if (isLoading) {
        return <Skeleton cantidad={4} />
    }

    if (isError) {
        return (
            <EstadoError
                mensaje="No se pudieron cargar tus pedidos."
                onReintentar={() => void refetch()}
            />
        )
    }

    const pedidos = data?.items ?? []
    const totalPaginas = Math.ceil((data?.total ?? 0) / limite)

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Mis pedidos
                </h1>
                <p className="mt-1 text-gray-600">
                    Consultá tus compras y el estado de cada pedido.
                </p>
            </div>

            {errorAccion && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {errorAccion}
                </p>
            )}

            {pedidos.length === 0 ? (
                <EstadoVacio mensaje="Todavía no realizaste ningún pedido." />
            ) : (
                <div className="flex flex-col gap-4">
                    {pedidos.map((pedido) => (
                        <Card key={pedido.id} className="flex flex-col gap-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="font-semibold text-gray-800">
                                        Pedido #{pedido.id}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            pedido.created_at.endsWith('Z')
                                                ? pedido.created_at
                                                : `${pedido.created_at}Z`
                                        ).toLocaleString('es-AR', {
                                            timeZone: 'America/Argentina/Buenos_Aires',
                                        })}
                                    </p>
                                </div>

                                <BadgeEstado estado={pedido.estado} />
                            </div>

                            <div className="flex flex-col gap-2">
                                {pedido.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between gap-3 text-sm"
                                    >
                    <span>
                      {item.nombre_producto} x {item.cantidad}
                    </span>
                                        <span>
                      ${Number(item.subtotal).toFixed(2)}
                    </span>
                                    </div>
                                ))}
                            </div>
                            <div className="rounded-md bg-gray-50 p-3 text-sm">
                                <h3 className="mb-2 font-semibold text-gray-700">
                                    Datos de entrega
                                </h3>

                                <p className="text-gray-600">
                                    <span className="font-medium">Dirección:</span>{' '}
                                    {pedido.direccion_entrega}
                                </p>

                                <p className="text-gray-600">
                                    <span className="font-medium">Forma de pago:</span>{' '}
                                    {pedido.forma_pago === 'EFECTIVO'
                                        ? 'Efectivo'
                                        : 'Transferencia'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <span className="font-semibold">
                  Total: ${Number(pedido.total).toFixed(2)}
                </span>

                                <div className="flex flex-wrap gap-2">
                                    {pedido.estado === 'PENDIENTE' && (
                                        <Button
                                            variant="danger"
                                            onClick={() => void handleCancelar(pedido.id)}
                                            disabled={cancelar.isPending}
                                        >
                                            Cancelar pedido
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {totalPaginas > 1 && (
                <Paginacion
                    paginaActual={pagina}
                    totalPaginas={totalPaginas}
                    onCambiarPagina={setPagina}
                />
            )}

            <Link to="/productos" className="self-start">
                <Button variant="outline">Volver al catálogo</Button>
            </Link>
        </section>
    )
}
