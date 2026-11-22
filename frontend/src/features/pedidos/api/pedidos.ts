
import { axiosInstance } from '../../../shared/api/axiosInstance'
import type {
    Pedido,
    PedidoCreate,
    PedidoEstadoUpdate,
    PedidoList,
    ResumenPedidos,
} from '../types/pedidos'

// Crear un pedido.
export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
    const response = await axiosInstance.post<Pedido>('/pedidos/', datos)
    return response.data
}

// Listar pedidos con paginación y filtro opcional por estado.
export async function getPedidos(filtros: {
    skip?: number
    limit?: number
    estado?: Pedido['estado']
} = {}): Promise<PedidoList> {
    const response = await axiosInstance.get<PedidoList>('/pedidos/', {
        params: filtros,
    })
    return response.data
}

// Obtener el detalle de un pedido.
export async function getPedido(id: number): Promise<Pedido> {
    const response = await axiosInstance.get<Pedido>(`/pedidos/${id}`)
    return response.data
}
// Listar solamente los pedidos del usuario autenticado.
export async function getMisPedidos(filtros: {
    skip?: number
    limit?: number
    estado?: Pedido['estado']
} = {}): Promise<PedidoList> {
    const response = await axiosInstance.get<PedidoList>('/pedidos/mios', {
        params: filtros,
    })
    return response.data
}
// Cancelar un pedido.
export async function cancelarPedido(id: number): Promise<Pedido> {
    const response = await axiosInstance.patch<Pedido>(
        `/pedidos/${id}/cancelar`,
    )
    return response.data
}

// Cambiar el estado de un pedido (administrador).
export async function cambiarEstadoPedido(
    id: number,
    datos: PedidoEstadoUpdate,
): Promise<Pedido> {
    const response = await axiosInstance.patch<Pedido>(
        `/pedidos/${id}/estado`,
        datos,
    )
    return response.data
}

// Obtener el resumen de pedidos (administrador).
export async function getResumenPedidos(): Promise<ResumenPedidos> {
    const response = await axiosInstance.get<ResumenPedidos>(
        '/pedidos/resumen',
    )
    return response.data
}
