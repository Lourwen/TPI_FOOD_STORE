import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProducto } from '../api/productos'

export function useEliminarProducto() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => deleteProducto(id),

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['productos'],
            })
        },
    })
}