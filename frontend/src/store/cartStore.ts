
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    producto_id: number
    nombre: string
    precio: number
    imagen_url: string | null
    cantidad: number
}

interface CartState {
    items: CartItem[]
    usuarioId: number | null
    carritosPorUsuario: Record<string, CartItem[]>
    setUsuario: (usuarioId: number | null) => void
    agregar: (producto: Omit<CartItem, 'cantidad'>) => void
    quitar: (productoId: number) => void
    cambiarCantidad: (productoId: number, cantidad: number) => void
    vaciar: () => void
    total: () => number
}

const obtenerClave = (usuarioId: number | null) =>
    usuarioId === null ? 'invitado' : String(usuarioId)

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            usuarioId: null,
            carritosPorUsuario: {},

            setUsuario: (usuarioId) => {
                set((state) => {
                    const carritos = {
                        ...state.carritosPorUsuario,
                        [obtenerClave(state.usuarioId)]: state.items,
                    }

                    return {
                        usuarioId,
                        carritosPorUsuario: carritos,
                        items: carritos[obtenerClave(usuarioId)] ?? [],
                    }
                })
            },

            agregar: (producto) => {
                set((state) => {
                    const existente = state.items.find(
                        (item) => item.producto_id === producto.producto_id,
                    )

                    const nuevosItems = existente
                        ? state.items.map((item) =>
                            item.producto_id === producto.producto_id
                                ? { ...item, cantidad: item.cantidad + 1 }
                                : item,
                        )
                        : [...state.items, { ...producto, cantidad: 1 }]

                    return {
                        items: nuevosItems,
                        carritosPorUsuario: {
                            ...state.carritosPorUsuario,
                            [obtenerClave(state.usuarioId)]: nuevosItems,
                        },
                    }
                })
            },

            quitar: (productoId) => {
                set((state) => {
                    const nuevosItems = state.items.filter(
                        (item) => item.producto_id !== productoId,
                    )

                    return {
                        items: nuevosItems,
                        carritosPorUsuario: {
                            ...state.carritosPorUsuario,
                            [obtenerClave(state.usuarioId)]: nuevosItems,
                        },
                    }
                })
            },

            cambiarCantidad: (productoId, cantidad) => {
                if (cantidad <= 0) {
                    get().quitar(productoId)
                    return
                }

                set((state) => {
                    const nuevosItems = state.items.map((item) =>
                        item.producto_id === productoId
                            ? { ...item, cantidad }
                            : item,
                    )

                    return {
                        items: nuevosItems,
                        carritosPorUsuario: {
                            ...state.carritosPorUsuario,
                            [obtenerClave(state.usuarioId)]: nuevosItems,
                        },
                    }
                })
            },

            vaciar: () => {
                set((state) => ({
                    items: [],
                    carritosPorUsuario: {
                        ...state.carritosPorUsuario,
                        [obtenerClave(state.usuarioId)]: [],
                    },
                }))
            },

            total: () =>
                get().items.reduce(
                    (acumulado, item) => acumulado + item.precio * item.cantidad,
                    0,
                ),
        }),
        {
            name: 'cart-storage',
        },
    ),
)
