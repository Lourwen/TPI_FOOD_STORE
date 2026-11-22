
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelarPedido } from '../api/pedidos'

export function useCancelarPedido() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => cancelarPedido(id),
        onSuccess: (pedido) => {
            queryClient.invalidateQueries({
                queryKey: ['pedidos'],
            })

            queryClient.invalidateQueries({
                queryKey: ['mis-pedidos'],
            })
            
            queryClient.invalidateQueries({
                queryKey: ['productos'],
            })

            queryClient.setQueryData(['pedidos', pedido.id], pedido)
        },
    })
}
