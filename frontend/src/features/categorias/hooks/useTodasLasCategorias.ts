import { useQuery } from '@tanstack/react-query'
import { getTodasLasCategorias } from '../api/categorias'

export function useTodasLasCategorias() {
    return useQuery({
        queryKey: ['categorias', 'admin', 'todas'],
        queryFn: getTodasLasCategorias,
    })
}