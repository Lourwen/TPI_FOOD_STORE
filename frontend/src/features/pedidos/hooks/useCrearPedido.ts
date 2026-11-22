
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearPedido } from '../api/pedidos'
import type { PedidoCreate } from '../types/pedidos'

export function useCrearPedido() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (datos: PedidoCreate) => crearPedido(datos),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['pedidos'],
            })

            queryClient.invalidateQueries({
                queryKey: ['mis-pedidos'],
            })

            queryClient.invalidateQueries({
                queryKey: ['productos'],
            })
        },
    })
}
