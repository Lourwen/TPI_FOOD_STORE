import { getPedidos, getMisPedidos } from '../api/pedidos'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import type { EstadoPedido } from '../types/pedidos'

interface PedidosFiltros {
    skip?: number
    limit?: number
    estado?: EstadoPedido
}

export function usePedidos(filtros: PedidosFiltros = {}) {
    return useQuery({
        queryKey: ['pedidos', filtros],
        queryFn: () => getPedidos(filtros),
        placeholderData: (datosAnteriores) => datosAnteriores,
    })
}
export function useMisPedidos(filtros: PedidosFiltros = {}) {
    const usuarioId = useAuthStore((state) => state.usuario?.id)

    return useQuery({
        queryKey: ['mis-pedidos', usuarioId, filtros],
        queryFn: () => getMisPedidos(filtros),
        enabled: usuarioId !== undefined,
    })
}