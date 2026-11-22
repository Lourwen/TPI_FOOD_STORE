import { useQuery } from '@tanstack/react-query'
import { getProducto } from '../api/productos'

export function useProducto(id: number) {
    return useQuery({
        queryKey: ['productos', id],
        queryFn: () => getProducto(id),
        enabled: id > 0,
    })
}