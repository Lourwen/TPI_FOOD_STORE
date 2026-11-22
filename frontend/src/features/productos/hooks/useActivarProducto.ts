
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activarProducto } from '../api/productos'

export function useActivarProducto() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => activarProducto(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] })
        },
    })
}
