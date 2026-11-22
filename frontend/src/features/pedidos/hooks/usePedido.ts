
import { useQuery } from '@tanstack/react-query'
import { getPedido } from '../api/pedidos'

export function usePedido(id: number) {
    return useQuery({
        queryKey: ['pedidos', id],
        queryFn: () => getPedido(id),
        enabled: id > 0,
    })
}
