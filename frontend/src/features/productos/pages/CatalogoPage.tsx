import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'
import { Skeleton } from '../../../shared/components/Skeleton'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Input } from '../../../shared/ui/Input'

export function CatalogoPage() {
    const [busqueda, setBusqueda] = useState('')
    const [paginaActual, setPaginaActual] = useState(1)

    const productosPorPagina = 6

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useProductos({
        skip: (paginaActual - 1) * productosPorPagina,
        limit: productosPorPagina,
        search: busqueda.trim() || undefined,
        disponible: true,
    })

    if (isLoading) {
        return <Skeleton cantidad={6} />
    }

    if (isError) {
        return (
            <EstadoError
                mensaje="No se pudieron cargar los productos."
                onReintentar={() => void refetch()}
            />
        )
    }

    const productos = data?.items ?? []
    const totalProductos = data?.total ?? 0
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina)

    const location = useLocation()
    const mensajeCompra = location.state?.mensajeCompra as string | undefined

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Catálogo de productos
                </h1>

                <p className="mt-1 text-gray-600">
                    Explorá nuestros productos y agregalos al carrito.
                </p>
            </div>
            {mensajeCompra && (
                <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {mensajeCompra}
                </p>
            )}

            <div className="max-w-md">
                <Input
                    label="Buscar productos"
                    placeholder="Ingresá el nombre del producto..."
                    value={busqueda}
                    onChange={(event) => {
                        setBusqueda(event.target.value)
                        setPaginaActual(1)
                    }}
                />
            </div>

            {productos.length === 0 ? (
                <EstadoVacio mensaje="No se encontraron productos." />
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {productos.map((producto) => (
                            <ProductoCard
                                key={producto.id}
                                producto={producto}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => setPaginaActual((pagina) => pagina - 1)}
                            disabled={paginaActual === 1}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Anterior
                        </button>

                        <span className="text-sm text-gray-600">
                            Página {paginaActual} de {totalPaginas}
                        </span>

                        <button
                            type="button"
                            onClick={() => setPaginaActual((pagina) => pagina + 1)}
                            disabled={paginaActual >= totalPaginas}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Siguiente
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}
