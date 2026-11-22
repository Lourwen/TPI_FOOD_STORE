import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProductoStock } from '../api/productos'

interface ActualizarStockDatos {
    id: number
    stock: number
    disponible: boolean
}

export function useActualizarStock() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, stock, disponible }: ActualizarStockDatos) =>
            updateProductoStock(id, stock, disponible),

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