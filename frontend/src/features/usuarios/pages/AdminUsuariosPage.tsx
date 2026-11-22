
import { useState } from 'react'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

import { useUsuarios } from '../hooks/useUsuarios'
import { useActivarUsuario } from '../hooks/useActivarUsuario'
import { useDesactivarUsuario } from '../hooks/useDesactivarUsuario'

import type { Usuario } from '../../auth/types'

import { useAuthStore } from '../../../store/authStore'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { handleApiError } from '../../../shared/api/handleApiError'

const columnHelper = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
    const usuarioActual = useAuthStore((state) => state.usuario)

    const {
        data: usuarios,
        isLoading,
        isError,
        refetch,
    } = useUsuarios()

    const activar = useActivarUsuario()
    const desactivar = useDesactivarUsuario()

    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')

    const handleCambiarEstado = async (usuario: Usuario) => {
        const accion = usuario.disabled ? 'activar' : 'desactivar'

        const confirmar = window.confirm(
            `¿Querés ${accion} la cuenta de "${usuario.username}"?`,
        )

        if (!confirmar) return

        setError('')
        setMensaje('')

        try {
            if (usuario.disabled) {
                await activar.mutateAsync(usuario.id)
                setMensaje(
                    `La cuenta de "${usuario.username}" fue activada correctamente.`,
                )
            } else {
                await desactivar.mutateAsync(usuario.id)
                setMensaje(
                    `La cuenta de "${usuario.username}" fue desactivada correctamente.`,
                )
            }
        } catch (err) {
            setError(handleApiError(err))
        }
    }

    const columnas = [
        columnHelper.accessor('username', {
            header: 'Usuario',
        }),
        columnHelper.accessor('full_name', {
            header: 'Nombre completo',
        }),
        columnHelper.accessor('email', {
            header: 'Email',
        }),
        columnHelper.accessor('role', {
            header: 'Rol',
            cell: (info) =>
                info.getValue() === 'admin' ? 'Administrador' : 'Cliente',
        }),
        columnHelper.accessor('disabled', {
            header: 'Estado',
            cell: (info) => (
                <span
                    className={
                        info.getValue()
                            ? 'font-medium text-red-700'
                            : 'font-medium text-green-700'
                    }
                >
                    {info.getValue() ? 'Desactivado' : 'Activo'}
                </span>
            ),
        }),
        columnHelper.accessor('created_at', {
            header: 'Fecha de registro',
            cell: (info) =>
                new Date(info.getValue()).toLocaleDateString('es-AR'),
        }),
        columnHelper.display({
            id: 'acciones',
            header: 'Acciones',
            cell: ({ row }) => {
                const usuario = row.original
                const esUsuarioActual = usuario.id === usuarioActual?.id

                return (
                    <Button
                        variant={usuario.disabled ? 'outline' : 'danger'}
                        onClick={() => void handleCambiarEstado(usuario)}
                        disabled={
                            esUsuarioActual ||
                            activar.isPending ||
                            desactivar.isPending
                        }
                    >
                        {usuario.disabled ? 'Activar' : 'Desactivar'}
                    </Button>
                )
            },
        }),
    ]

    const tabla = useReactTable({
        data: usuarios ?? [],
        columns: columnas,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) {
        return <Skeleton cantidad={4} />
    }

    if (isError) {
        return (
            <EstadoError
                mensaje="No se pudieron cargar los usuarios."
                onReintentar={() => void refetch()}
            />
        )
    }

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Administración de usuarios
                </h1>
                <p className="mt-1 text-gray-600">
                    Consultá las cuentas registradas y administrá su estado.
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
                    Usuarios registrados
                </h2>

                {!usuarios?.length ? (
                    <EstadoVacio mensaje="Todavía no hay usuarios registrados." />
                ) : (
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
                )}
            </Card>
        </section>
    )
}
