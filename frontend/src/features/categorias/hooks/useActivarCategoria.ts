import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activarCategoria } from '../api/categorias'

export function useActivarCategoria() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => activarCategoria(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] })
        },
    })
}