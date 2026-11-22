
export type EstadoPedido =
    | 'PENDIENTE'
    | 'EN_PREPARACION'
    | 'ENTREGADO'
    | 'CANCELADO'

export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

// Los importes Decimal llegan como cadenas desde la API.
export type Importe = string

export interface DetallePedido {
    id: number
    producto_id: number
    cantidad: number
    nombre_producto: string
    precio_unitario: Importe
    subtotal: Importe
}

export interface Pedido {
    id: number
    usuario_id: number
    usuario: {
        id: number
        full_name: string
        email: string
    }
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: string
    notas: string | null
    total: Importe
    created_at: string
    updated_at: string
    items: DetallePedido[]
}

export interface PedidoList {
    total: number
    items: Pedido[]
}

export interface PedidoCreate {
    items: {
        producto_id: number
        cantidad: number
    }[]
    forma_pago: FormaPago
    direccion_entrega: string
    notas?: string | null
}

export interface ResumenPedidos {
    pendientes: number
    en_preparacion: number
    entregados: number
    cancelados: number
    pedidos_hoy: number
    ingresos_entregados: Importe
}
export interface PedidoEstadoUpdate {
    estado: EstadoPedido
}