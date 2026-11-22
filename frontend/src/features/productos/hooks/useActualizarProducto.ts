import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProducto } from '../api/productos'
import type { ProductoUpdate } from '../types'

interface ActualizarProductoDatos {
    id: number
    datos: ProductoUpdate
}

export function useActualizarProducto() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, datos }: ActualizarProductoDatos) =>
            updateProducto(id, datos),

        onSuccess: (producto) => {
            queryClient.invalidateQueries({
                queryKey: ['productos'],
            })

            queryClient.setQueryData(
                ['productos', producto.id],
                producto,
            )
        },
    })
}