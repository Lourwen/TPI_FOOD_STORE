
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cambiarEstadoPedido } from '../api/pedidos'
import type {
    PedidoEstadoUpdate,
} from '../types/pedidos'

interface CambiarEstadoDatos {
    id: number
    datos: PedidoEstadoUpdate
}

export function useCambiarEstadoPedido() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, datos }: CambiarEstadoDatos) =>
            cambiarEstadoPedido(id, datos),

        onSuccess: (pedido) => {
            queryClient.invalidateQueries({
                queryKey: ['pedidos'],
            })
            queryClient.invalidateQueries({
                queryKey: ['mis-pedidos'],
            })

            queryClient.invalidateQueries({
                queryKey: ['resumen-pedidos'],
            })

            queryClient.invalidateQueries({
                queryKey: ['productos'],
            })

            queryClient.setQueryData(['pedidos', pedido.id], pedido)
        },
    })
}
