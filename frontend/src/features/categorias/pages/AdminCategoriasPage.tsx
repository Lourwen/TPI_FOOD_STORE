
import { useMemo, useState } from 'react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { useTodasLasCategorias } from '../hooks/useTodasLasCategorias'
import { useActivarCategoria } from '../hooks/useActivarCategoria'
import { useCrearCategoria } from '../hooks/useCrearCategoria'
import { useActualizarCategoria } from '../hooks/useActualizarCategoria'
import { useEliminarCategoria } from '../hooks/useEliminarCategoria'
import type { Categoria } from '../types'

import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

const columnHelper = createColumnHelper<Categoria>()

export function AdminCategoriasPage() {
    const { data, isLoading, isError, refetch } = useTodasLasCategorias()

    const crear = useCrearCategoria()
    const actualizar = useActualizarCategoria()
    const eliminar = useEliminarCategoria()
    const activar = useActivarCategoria()

    const [categoriaEditando, setCategoriaEditando] =
        useState<Categoria | null>(null)

    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const limpiarFormulario = () => {
        setCategoriaEditando(null)
        setNombre('')
        setDescripcion('')
        setError('')
    }

    const iniciarEdicion = (categoria: Categoria) => {
        setCategoriaEditando(categoria)
        setNombre(categoria.nombre)
        setDescripcion(categoria.descripcion ?? '')
        setError('')
        setMensaje('')
    }

    const handleGuardar = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMensaje('')

        if (nombre.trim().length < 2 || nombre.trim().length > 100) {
            setError('El nombre debe tener entre 2 y 100 caracteres.')
            return
        }

        try {
            const datos = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null,
            }

            if (categoriaEditando) {
                await actualizar.mutateAsync({
                    id: categoriaEditando.id,
                    datos,
                })
                setMensaje('Categoría actualizada correctamente.')
            } else {
                await crear.mutateAsync(datos)
                setMensaje('Categoría creada correctamente.')
            }

            limpiarFormulario()
        } catch (err) {
            setError(handleApiError(err))
        }
    }

    const handleEliminar = async (categoria: Categoria) => {
        const confirmar = window.confirm(
            `¿Querés desactivar la categoría "${categoria.nombre}"?`,
        )

        if (!confirmar) return

        setError('')
        setMensaje('')

        try {
            await eliminar.mutateAsync(categoria.id)
            setMensaje('Categoría desactivada correctamente.')

            if (categoriaEditando?.id === categoria.id) {
                limpiarFormulario()
            }
        } catch (err) {
            setError(handleApiError(err))
        }
    }

    const handleActivar = async (categoria: Categoria) => {
        setError('')
        setMensaje('')

        try {
            await activar.mutateAsync(categoria.id)
            setMensaje('Categoría activada correctamente.')
        } catch (err) {
            setError(handleApiError(err))
        }
    }


    const columnas = useMemo(
        () => [
            columnHelper.accessor('nombre', {
                header: 'Nombre',
            }),
            columnHelper.accessor('descripcion', {
                header: 'Descripción',
                cell: (info) => info.getValue() || 'Sin descripción',
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
            {info.getValue() ? 'Activa' : 'Inactiva'}
          </span>
                ),
            }),
            columnHelper.display({
                id: 'acciones',
                header: 'Acciones',
                cell: ({ row }) => {
                    const categoria = row.original

                    return (
                        <div className="flex flex-wrap gap-2">
                            {categoria.activo ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => iniciarEdicion(categoria)}
                                    >
                                        Editar
                                    </Button>

                                    <Button
                                        variant="danger"
                                        onClick={() => void handleEliminar(categoria)}
                                        disabled={eliminar.isPending}
                                    >
                                        Desactivar
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => void handleActivar(categoria)}
                                    disabled={activar.isPending}
                                >
                                    Activar
                                </Button>
                            )}
                        </div>
                    )
                },
            }),
        ],
        [eliminar.isPending, activar.isPending],
    )

    const tabla = useReactTable({
        data: data ?? [],
        columns: columnas,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) {
        return <Skeleton cantidad={4} />
    }

    if (isError) {
        return (
            <EstadoError
                mensaje="No se pudieron cargar las categorías."
                onReintentar={() => void refetch()}
            />
        )
    }

    const procesando =
        crear.isPending || actualizar.isPending || eliminar.isPending

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Administración de categorías
                </h1>
                <p className="mt-1 text-gray-600">
                    Creá, modificá y administrá las categorías de productos.
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
                    {categoriaEditando ? 'Editar categoría' : 'Nueva categoría'}
                </h2>

                <form onSubmit={handleGuardar} className="flex flex-col gap-4">
                    <Input
                        label="Nombre"
                        name="nombre"
                        value={nombre}
                        onChange={(event) => setNombre(event.target.value)}
                        placeholder="Ej.: Almacén"
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
                            className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descripción de la categoría..."
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={procesando}>
                            {procesando
                                ? 'Guardando...'
                                : categoriaEditando
                                    ? 'Guardar cambios'
                                    : 'Crear categoría'}
                        </Button>

                        {categoriaEditando && (
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
                <h2 className="text-lg font-semibold">Categorías registradas</h2>

                {!data || data.length === 0 ? (
                    <EstadoVacio mensaje="Todavía no hay categorías registradas." />
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
                            {tabla.getRowModel().rows.map((fila) => (
                                <tr key={fila.id} className="border-b">
                                    {fila.getVisibleCells().map((celda) => (
                                        <td key={celda.id} className="px-4 py-3 align-middle">
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
                )}
            </Card>
        </section>
    )
}
