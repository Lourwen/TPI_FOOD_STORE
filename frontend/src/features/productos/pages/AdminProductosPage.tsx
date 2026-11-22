import { useActivarProducto } from '../hooks/useActivarProducto'
import { useState, type FormEvent } from 'react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { useTodosProductos } from '../hooks/useTodosProductos'
import { useCrearProducto } from '../hooks/useCrearProducto'
import { useActualizarProducto } from '../hooks/useActualizarProducto'
import { useEliminarProducto } from '../hooks/useEliminarProducto'
import { useActualizarStock } from '../hooks/useActualizarStock'
import { useCategorias } from '../../categorias/hooks/useCategorias'

import type { Producto } from '../types'

import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

const columnHelper = createColumnHelper<Producto>()

export function AdminProductosPage() {
    const [paginaActual, setPaginaActual] = useState(1)

    const productosPorPagina = 10

    const {
        data: productos,
        isLoading,
        isError,
        refetch,
    } = useTodosProductos({
        skip: (paginaActual - 1) * productosPorPagina,
        limit: productosPorPagina,
    })

    const {
        data: categorias,
        isLoading: cargandoCategorias,
        isError: errorCategorias,
    } = useCategorias()

    const crear = useCrearProducto()
    const actualizar = useActualizarProducto()
    const eliminar = useEliminarProducto()
    const activar = useActivarProducto()
    const actualizarStock = useActualizarStock()

    const [productoEditando, setProductoEditando] =
        useState<Producto | null>(null)

    const [categoriaId, setCategoriaId] = useState('')
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [precio, setPrecio] = useState('')
    const [imagenUrl, setImagenUrl] = useState('')
    const [stock, setStock] = useState('0')
    const [disponible, setDisponible] = useState(true)

    const [stockPendiente, setStockPendiente] =
        useState<Record<number, string>>({})

    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const limpiarFormulario = () => {
        setProductoEditando(null)
        setCategoriaId('')
        setNombre('')
        setDescripcion('')
        setPrecio('')
        setImagenUrl('')
        setStock('0')
        setDisponible(true)
        setError('')
    }

    const iniciarEdicion = (producto: Producto) => {
        setProductoEditando(producto)
        setCategoriaId(String(producto.categoria_id))
        setNombre(producto.nombre)
        setDescripcion(producto.descripcion ?? '')
        setPrecio(producto.precio_base)
        setImagenUrl(producto.imagen_url ?? '')
        setStock(String(producto.stock))
        setDisponible(producto.disponible)
        setError('')
        setMensaje('')
    }

    const handleGuardar = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMensaje('')

        const precioNumerico = Number(precio)
        const stockNumerico = Number(stock)

        if (!categoriaId) {
            setError('Seleccioná una categoría.')
            return
        }

        if (nombre.trim().length < 2 || nombre.trim().length > 100) {
            setError('El nombre debe tener entre 2 y 100 caracteres.')
            return
        }

        if (!Number.isFinite(precioNumerico) || precioNumerico < 0) {
            setError('Ingresá un precio válido mayor o igual a cero.')
            return
        }

        if (!/^\d+(\.\d{1,2})?$/.test(precio)) {
            setError('El precio debe tener como máximo dos decimales.')
            return
        }

        if (!Number.isInteger(stockNumerico) || stockNumerico < 0) {
            setError('El stock debe ser un número entero mayor o igual a cero.')
            return
        }

        try {
            const datos = {
                categoria_id: Number(categoriaId),
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null,
                precio_base: precioNumerico,
                imagen_url: imagenUrl.trim() || null,
                stock: stockNumerico,
                disponible,
            }

            if (productoEditando) {
                await actualizar.mutateAsync({
                    id: productoEditando.id,
                    datos,
                })
                setMensaje('Producto actualizado correctamente.')
            } else {
                await crear.mutateAsync(datos)
                setMensaje('Producto creado correctamente.')
            }

            limpiarFormulario()
        } catch (err) {
            setError(handleApiError(err))
        }
    }

    const handleEliminar = async (producto: Producto) => {
        const confirmar = window.confirm(
            `¿Querés desactivar el producto "${producto.nombre}"?`,
        )

        if (!confirmar) return

        setError('')
        setMensaje('')

        try {
            await eliminar.mutateAsync(producto.id)
            setMensaje('Producto desactivado correctamente.')

            if (productoEditando?.id === producto.id) {
                limpiarFormulario()
            }
        } catch (err) {
            setError(handleApiError(err))
        }
    }


    const handleActivar = async (producto: Producto) => {
        setError('')
        setMensaje('')

        try {
            await activar.mutateAsync(producto.id)
            setMensaje('Producto activado correctamente.')
        } catch (err) {
            setError(handleApiError(err))
        }
    }


    const handleActualizarStock = async (producto: Producto) => {
        const valorIngresado =
            stockPendiente[producto.id] ?? String(producto.stock)

        if (valorIngresado.trim() === '') {
            setError('Ingresá un valor para el stock.')
            return
        }

        const nuevoStock = Number(valorIngresado)

        if (!Number.isInteger(nuevoStock) || nuevoStock < 0) {
            setError('El stock debe ser un número entero mayor o igual a cero.')
            return
        }

        setError('')
        setMensaje('')

        try {
            await actualizarStock.mutateAsync({
                id: producto.id,
                stock: nuevoStock,
                disponible: producto.disponible,
            })

            setMensaje(`Stock de "${producto.nombre}" actualizado.`)

            setStockPendiente((actual) => ({
                ...actual,
                [producto.id]: String(nuevoStock),
            }))
        } catch (err) {
            setError(handleApiError(err))
        }
    }

    const procesando =
        crear.isPending || actualizar.isPending || eliminar.isPending

    const columnas = [
        columnHelper.accessor('nombre', {
            header: 'Nombre',
        }),
        columnHelper.accessor('categoria_id', {
            header: 'Categoría',
            cell: (info) =>
                categorias?.find(
                    (categoria) => categoria.id === info.getValue(),
                )?.nombre ?? 'Sin categoría',
        }),
        columnHelper.accessor('precio_base', {
            header: 'Precio',
            cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
        }),
        columnHelper.accessor('stock', {
            header: 'Stock',
            cell: ({row}) => {
                const producto = row.original

                const valorStock =
                    stockPendiente[producto.id] ?? String(producto.stock)

                const tieneCambiosStock =
                    valorStock !== String(producto.stock)

                return (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="0"
                            step="1"
                            value={valorStock}
                            onChange={(event) =>
                                setStockPendiente((actual) => ({
                                    ...actual,
                                    [producto.id]: event.target.value,
                                }))
                            }
                            disabled={!producto.activo}
                            className="w-20 rounded-md border border-gray-300 px-2 py-1"
                        />

                        {producto.activo && (
                            <Button
                                variant="outline"
                                className={
                                    tieneCambiosStock
                                        ? 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600'
                                        : ''
                                }
                                onClick={() =>
                                    void handleActualizarStock(producto)
                                }
                                disabled={
                                    actualizarStock.isPending ||
                                    !tieneCambiosStock
                                }
                            >
                                {tieneCambiosStock
                                    ? 'Guardar cambios'
                                    : 'Guardar'}
                            </Button>
                        )}
                    </div>
                )
            },
        }),
        columnHelper.accessor('disponible', {
            header: 'Disponibilidad',
            cell: (info) =>
                info.getValue() ? 'Disponible' : 'No disponible',
        }),
        columnHelper.accessor('activo', {
            header: 'Estado',
            cell: (info) => (
                <span
                    className={
                        info.getValue()
                            ? 'font-medium text-green-700'
                            : 'font-medium text-gray-500'
                    }
                >
                    {info.getValue() ? 'Activo' : 'Inactivo'}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'acciones',
            header: 'Acciones',
            cell: ({row}) => {
                const producto = row.original


                return (
                    <div className="flex flex-wrap gap-2">
                        {producto.activo ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => iniciarEdicion(producto)}
                                >
                                    Editar
                                </Button>

                                <Button
                                    variant="danger"
                                    onClick={() => void handleEliminar(producto)}
                                    disabled={eliminar.isPending}
                                >
                                    Desactivar
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={() => void handleActivar(producto)}
                                disabled={activar.isPending}
                            >
                                Activar
                            </Button>
                        )}
                    </div>
                )

            },
        }),
    ]

    const tabla = useReactTable({
        data: productos?.items ?? [],
        columns: columnas,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading || cargandoCategorias) {
        return <Skeleton cantidad={4}/>
    }

    if (isError || errorCategorias) {
        return (
            <EstadoError
                mensaje="No se pudieron cargar los productos o las categorías."
                onReintentar={() => void refetch()}
            />
        )
    }

    const categoriasActivas = (categorias ?? []).filter(
        (categoria) => categoria.activo,
    )

    const totalPaginas = Math.ceil(
        (productos?.total ?? 0) / productosPorPagina,
    )

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Administración de productos
                </h1>
                <p className="mt-1 text-gray-600">
                    Creá, modificá y administrá los productos del catálogo.
                </p>
            </div>

            {mensaje && (
                <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {mensaje}
                </p>
            )}

            {error && (
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            <Card className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">
                    {productoEditando ? 'Editar producto' : 'Nuevo producto'}
                </h2>

                <form onSubmit={handleGuardar} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="categoria"
                            className="text-sm font-medium text-gray-700"
                        >
                            Categoría
                        </label>

                        <select
                            id="categoria"
                            value={categoriaId}
                            onChange={(event) => setCategoriaId(event.target.value)}
                            required
                            className="rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">Seleccioná una categoría</option>
                            {categoriasActivas.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>
                                    {categoria.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Nombre"
                        name="nombre"
                        value={nombre}
                        onChange={(event) => setNombre(event.target.value)}
                        placeholder="Ej.: Yerba mate"
                        minLength={2}
                        maxLength={100}
                        required
                    />

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="descripcion"
                            className="text-sm font-medium text-gray-700"
                        >
                            Descripción (opcional)
                        </label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(event) => setDescripcion(event.target.value)}
                            rows={3}
                            className="rounded-md border border-gray-300 px-3 py-2"
                            placeholder="Descripción del producto..."
                        />
                    </div>

                    <Input
                        label="Precio"
                        name="precio"
                        type="number"
                        min="0"
                        step="0.01"
                        value={precio}
                        onChange={(event) => setPrecio(event.target.value)}
                        placeholder="Ej.: 2500.00"
                        required
                    />

                    <Input
                        label="URL de imagen (opcional)"
                        name="imagen_url"
                        type="url"
                        value={imagenUrl}
                        onChange={(event) => setImagenUrl(event.target.value)}
                        placeholder="https://..."
                    />

                    <Input
                        label="Stock"
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={stock}
                        onChange={(event) => setStock(event.target.value)}
                        required
                    />

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={disponible}
                            onChange={(event) => setDisponible(event.target.checked)}
                        />
                        Producto disponible para la venta
                    </label>

                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={procesando}>
                            {procesando
                                ? 'Guardando...'
                                : productoEditando
                                    ? 'Guardar cambios'
                                    : 'Crear producto'}
                        </Button>

                        {productoEditando && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={limpiarFormulario}
                            >
                                Cancelar edición
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            <Card className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">
                    Productos registrados
                </h2>

                {!productos?.items.length ? (
                    <EstadoVacio mensaje="Todavía no hay productos registrados."/>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                {tabla.getHeaderGroups().map((grupo) => (
                                    <tr key={grupo.id}>
                                        {grupo.headers.map((header) => (
                                            <th
                                                key={header.id}
                                                className="border-b px-4 py-3"
                                            >
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
                                {tabla.getRowModel().rows.map((fila) => (
                                    <tr key={fila.id} className="border-b">
                                        {fila.getVisibleCells().map((celda) => (
                                            <td
                                                key={celda.id}
                                                className="px-4 py-3 align-middle"
                                            >
                                                {flexRender(
                                                    celda.column.columnDef.cell,
                                                    celda.getContext(),
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setPaginaActual((pagina) => pagina - 1)}
                                disabled={paginaActual === 1}
                            >
                                Anterior
                            </Button>

                            <span className="text-sm text-gray-600">
                            Página {paginaActual} de {totalPaginas}
                        </span>

                            <Button
                                variant="outline"
                                onClick={() => setPaginaActual((pagina) => pagina + 1)}
                                disabled={paginaActual >= totalPaginas}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </>
                )}
            </Card>
        </section>
    )
}
