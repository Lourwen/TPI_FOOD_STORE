
import { useMemo, useState } from 'react'
import {
    getCoreRowModel,
    useReactTable,
    createColumnHelper,
    flexRender,
} from '@tanstack/react-table'

import { usePedidos } from '../hooks/usePedidos'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import type { Pedido, EstadoPedido } from '../types/pedidos'

import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Paginacion } from '../../../shared/components/Paginacion'
import { handleApiError } from '../../../shared/api/handleApiError'

const columnHelper = createColumnHelper<Pedido>()

const opcionesEstado: { value: EstadoPedido; label: string }[] = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'EN_PREPARACION', label: 'En preparación' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'CANCELADO', label: 'Cancelado' },
]

export function AdminPedidosPage() {
    const [estado, setEstado] = useState<EstadoPedido | ''>('')
    const [pagina, setPagina] = useState(1)
    const [errorAccion, setErrorAccion] = useState('')
    const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null)

    const limite = 10

    const { data, isLoading, isError, refetch } = usePedidos({
        skip: (pagina - 1) * limite,
        limit: limite,
        estado: estado || undefined,
    })

    const cambiarEstado = useCambiarEstadoPedido()

    const handleCambiarEstado = async (
        pedidoId: number,
        nuevoEstado: EstadoPedido,
    ) => {
        setErrorAccion('')

        try {
            await cambiarEstado.mutateAsync({
                id: pedidoId,
                datos: { estado: nuevoEstado },
            })
        } catch (error) {
            setErrorAccion(handleApiError(error))
        }
    }


    const handleCancelar = (pedidoId: number) => {
        const confirmar = window.confirm(
            '¿Estás seguro de que querés cancelar este pedido? Se restituirá el stock.'
        )

        if (!confirmar) return

        void handleCambiarEstado(pedidoId, 'CANCELADO')
    }

    const columnas = useMemo(
        () => [
            columnHelper.accessor('id', {
                header: 'N.º',
                cell: (info) => `#${info.getValue()}`,
            }),
            columnHelper.accessor('usuario_id', {
                header: 'Cliente ID',
            }),
            columnHelper.accessor('created_at', {
                header: 'Fecha',
                cell: (info) =>
                    new Date(info.getValue()).toLocaleString('es-AR'),
            }),
            columnHelper.accessor('total', {
                header: 'Total',
                cell: (info) =>
                    `$${Number(info.getValue()).toFixed(2)}`,
            }),
            columnHelper.accessor('estado', {
                header: 'Estado',
                cell: (info) => <BadgeEstado estado={info.getValue()} />,
            }),
            columnHelper.display({
                id: 'detalle',
                header: 'Detalle',
                cell: ({ row }) => {
                    const pedido = row.original
                    const expandido = pedidoExpandido === pedido.id

                    return (
                        <Button
                            variant="outline"
                            onClick={() =>
                                setPedidoExpandido(expandido ? null : pedido.id)
                            }
                        >
                            {expandido ? 'Ocultar' : 'Ver detalle'}
                        </Button>
                    )
                },
            }),
            columnHelper.display({
                id: 'acciones',
                header: 'Cambiar estado',
                cell: ({ row }) => {
                    const pedido = row.original

                    if (
                        pedido.estado === 'ENTREGADO' ||
                        pedido.estado === 'CANCELADO'
                    ) {
                        return <span className="text-sm text-gray-500">Sin acciones</span>
                    }

                    return (
                        <div className="flex flex-wrap gap-2">
                            {pedido.estado === 'PENDIENTE' && (
                                <>
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            void handleCambiarEstado(
                                                pedido.id,
                                                'EN_PREPARACION',
                                            )
                                        }
                                        disabled={cambiarEstado.isPending}
                                    >
                                        Preparar
                                    </Button>

                                    <Button
                                        variant="danger"
                                        onClick={() => handleCancelar(pedido.id)}
                                        disabled={cambiarEstado.isPending}
                                    >
                                        Cancelar
                                    </Button>
                                </>
                            )}

                            {pedido.estado === 'EN_PREPARACION' && (
                                <>
                                    <Button
                                        onClick={() =>
                                            void handleCambiarEstado(
                                                pedido.id,
                                                'ENTREGADO',
                                            )
                                        }
                                        disabled={cambiarEstado.isPending}
                                    >
                                        Entregar
                                    </Button>

                                    <Button
                                        variant="danger"
                                        onClick={() => handleCancelar(pedido.id)}
                                        disabled={cambiarEstado.isPending}
                                    >
                                        Cancelar
                                    </Button>
                                </>
                            )}
                        </div>
                    )
                },
            }),
        ],
        [cambiarEstado.isPending, pedidoExpandido],
    )

    const tabla = useReactTable({
        data: data?.items ?? [],
        columns: columnas,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) {
        return <Skeleton cantidad={5} />
    }

    if (isError) {
        return (
            <EstadoError
                mensaje="No se pudieron cargar los pedidos."
                onReintentar={() => void refetch()}
            />
        )
    }

    const totalPaginas = Math.ceil((data?.total ?? 0) / limite)

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Administración de pedidos
                </h1>
                <p className="mt-1 text-gray-600">
                    Consultá los pedidos y gestioná sus estados.
                </p>
            </div>

            <Card className="flex flex-col gap-4">
                <div className="max-w-xs">
                    <label
                        htmlFor="filtro-estado"
                        className="mb-1 block text-sm font-medium text-gray-700"
                    >
                        Filtrar por estado
                    </label>
                    <select
                        id="filtro-estado"
                        value={estado}
                        onChange={(event) => {
                            setEstado(event.target.value as EstadoPedido | '')
                            setPagina(1)
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                        <option value="">Todos los estados</option>
                        {opcionesEstado.map((opcion) => (
                            <option key={opcion.value} value={opcion.value}>
                                {opcion.label}
                            </option>
                        ))}
                    </select>
                </div>

                {errorAccion && (
                    <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                        {errorAccion}
                    </p>
                )}

                {(data?.items.length ?? 0) === 0 ? (
                    <EstadoVacio mensaje="No se encontraron pedidos." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                            {tabla.getHeaderGroups().map((grupo) => (
                                <tr key={grupo.id}>
                                    {grupo.headers.map((header) => (
                                        <th key={header.id} className="border-b px-4 py-3">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody>
                            {tabla.getRowModel().rows.map((fila) => {
                                const pedido = fila.original
                                const expandido = pedidoExpandido === pedido.id

                                return (
                                    <>
                                        <tr
                                            key={fila.id}
                                            className={`border-b transition-colors ${
                                                expandido
                                                    ? 'bg-blue-200 text-gray-950 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {fila.getVisibleCells().map((celda) => (
                                                <td key={celda.id} className="px-4 py-3 align-middle">
                                                    {flexRender(
                                                        celda.column.columnDef.cell,
                                                        celda.getContext(),
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        {expandido && (
                                            <tr>
                                                <td
                                                    colSpan={fila.getVisibleCells().length}
                                                    className="bg-blue-100 border-l-4 border-blue-500 px-4 py-4 text-gray-900"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <h3 className="text-base font-bold text-blue-950">
                                                            Detalle del pedido #{pedido.id}
                                                        </h3>

                                                        <div className="rounded-md bg-white p-3 text-sm">
                                                            <h4 className="mb-2 font-semibold">Datos del cliente</h4>

                                                            <p>
                                                                <strong>Nombre:</strong> {pedido.usuario.full_name}
                                                            </p>

                                                            <p>
                                                                <strong>Correo electrónico:</strong> {pedido.usuario.email}
                                                            </p>

                                                            <p>
                                                                <strong>ID de usuario:</strong> {pedido.usuario_id}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <h4 className="mb-2 text-sm font-semibold">
                                                                Productos
                                                            </h4>

                                                            {pedido.items.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex flex-wrap justify-between gap-2 border-b py-2 text-sm"
                                                                >
                                        <span>
                                            {item.nombre_producto} x {item.cantidad}
                                        </span>

                                                                    <span>
                                            ${Number(item.precio_unitario).toFixed(2)}
                                                                        {' · Subtotal: '}
                                                                        ${Number(item.subtotal).toFixed(2)}
                                        </span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                                                            <p>
                                                                <strong>Dirección:</strong>{' '}
                                                                {pedido.direccion_entrega}
                                                            </p>

                                                            <p>
                                                                <strong>Forma de pago:</strong>{' '}
                                                                {pedido.forma_pago === 'EFECTIVO'
                                                                    ? 'Efectivo'
                                                                    : 'Transferencia'}
                                                            </p>

                                                            <p className="sm:col-span-2">
                                                                <strong>Notas:</strong>{' '}
                                                                {pedido.notas || 'Sin notas'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {totalPaginas > 1 && (
                <Paginacion
                    paginaActual={pagina}
                    totalPaginas={totalPaginas}
                    onCambiarPagina={setPagina}
                />
            )}
        </section>
    )
}
