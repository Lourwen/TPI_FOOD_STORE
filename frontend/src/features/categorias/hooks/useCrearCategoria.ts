
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crearCategoria } from '../api/categorias'
import type { CategoriaCreate } from '../types'

export function useCrearCategoria() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (datos: CategoriaCreate) => crearCategoria(datos),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] })
        },
    })
}
