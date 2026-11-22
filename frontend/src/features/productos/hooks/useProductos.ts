import { useQuery } from '@tanstack/react-query'
import { getProductos } from '../api/productos'

interface ProductosFiltros {
    skip?: number
    limit?: number
    search?: string
    categoria_id?: number
    disponible?: boolean
}

export function useProductos(filtros: ProductosFiltros = {}) {
    return useQuery({
        queryKey: ['productos', filtros],
        queryFn: () => getProductos(filtros),
        placeholderData: (datosAnteriores) => datosAnteriores,
    })
}