import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProducto } from '../api/productos'
import type { ProductoCreate } from '../types'

export function useCrearProducto() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (datos: ProductoCreate) => createProducto(datos),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['productos'],
            })
        },
    })
}