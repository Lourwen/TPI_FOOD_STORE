
import { useQuery } from '@tanstack/react-query'
import { getTodosProductos } from '../api/productos'

interface ProductosFiltros {
    skip?: number
    limit?: number
    search?: string
    categoria_id?: number
    disponible?: boolean
}

export function useTodosProductos(filtros: ProductosFiltros = {}) {
    return useQuery({
        queryKey: ['productos', 'admin', filtros],
        queryFn: () => getTodosProductos(filtros),
        placeholderData: (datosAnteriores) => datosAnteriores,
    })
}
