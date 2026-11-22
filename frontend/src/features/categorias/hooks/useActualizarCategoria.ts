
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { actualizarCategoria } from '../api/categorias'
import type { CategoriaUpdate } from '../types'

interface ActualizarCategoriaDatos {
    id: number
    datos: CategoriaUpdate
}

export function useActualizarCategoria() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, datos }: ActualizarCategoriaDatos) =>
            actualizarCategoria(id, datos),

        onSuccess: (categoria) => {
            queryClient.invalidateQueries({ queryKey: ['categorias'] })
            queryClient.setQueryData(['categorias', categoria.id], categoria)
        },
    })
}
