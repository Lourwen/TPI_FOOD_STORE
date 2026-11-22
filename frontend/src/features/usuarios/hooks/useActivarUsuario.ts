import { useMutation, useQueryClient } from '@tanstack/react-query'
import { activarUsuario } from '../api/usuarios'

export function useActivarUsuario() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => activarUsuario(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] })
        },
    })
}