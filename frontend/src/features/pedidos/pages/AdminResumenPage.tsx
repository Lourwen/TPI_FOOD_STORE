
import { useResumenPedidos } from '../hooks/useResumenPedidos'

import { Card } from '../../../shared/ui/Card'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoError } from '../../../shared/components/EstadoError'

interface IndicadorProps {
    titulo: string
    valor: string | number
    descripcion: string
}

function Indicador({ titulo, valor, descripcion }: IndicadorProps) {
    return (
        <Card className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-500">{titulo}</p>
            <p className="text-3xl font-bold text-gray-800">{valor}</p>
            <p className="text-sm text-gray-500">{descripcion}</p>
        </Card>
    )
}

export function AdminResumenPage() {
    const { data, isLoading, isError, refetch } = useResumenPedidos()

    if (isLoading) {
        return <Skeleton cantidad={6} />
    }

    if (isError || !data) {
        return (
            <EstadoError
                mensaje="No se pudo cargar el resumen de pedidos."
                onReintentar={() => void refetch()}
            />
        )
    }

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Resumen de pedidos
                </h1>
                <p className="mt-1 text-gray-600">
                    Indicadores generales de las ventas y los pedidos.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Indicador
                    titulo="Pendientes"
                    valor={data.pendientes}
                    descripcion="Pedidos esperando preparación"
                />

                <Indicador
                    titulo="En preparación"
                    valor={data.en_preparacion}
                    descripcion="Pedidos en proceso"
                />

                <Indicador
                    titulo="Entregados"
                    valor={data.entregados}
                    descripcion="Pedidos completados"
                />

                <Indicador
                    titulo="Cancelados"
                    valor={data.cancelados}
                    descripcion="Pedidos cancelados"
                />

                <Indicador
                    titulo="Pedidos de hoy"
                    valor={data.pedidos_hoy}
                    descripcion="Pedidos registrados durante el día"
                />

                <Indicador
                    titulo="Ingresos por entregas"
                    valor={`$${Number(data.ingresos_entregados).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}`}
                    descripcion="Total de pedidos entregados"
                />
            </div>
        </section>
    )
}
