
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from '@tanstack/react-form'

import { useCartStore } from '../../../store/cartStore'
import { useCrearPedido } from '../hooks/useCrearPedido'
import type { FormaPago } from '../types/pedidos'

import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'

export function CheckoutPage() {
    const items = useCartStore((state) => state.items)
    const vaciar = useCartStore((state) => state.vaciar)
    const total = useCartStore((state) => state.total)

    const crearPedido = useCrearPedido()
    const navigate = useNavigate()

    const [errorGeneral, setErrorGeneral] = useState('')

    const form = useForm({
        defaultValues: {
            forma_pago: 'EFECTIVO' as FormaPago,
            direccion_entrega: '',
            notas: '',
        },

        onSubmit: async ({ value }) => {
            setErrorGeneral('')

            try {
                await crearPedido.mutateAsync({
                    items: items.map((item) => ({
                        producto_id: item.producto_id,
                        cantidad: item.cantidad,
                    })),
                    forma_pago: value.forma_pago,
                    direccion_entrega: value.direccion_entrega,
                    notas: value.notas || null,
                })

                vaciar()
                navigate('/productos', {
                    state: {
                        mensajeCompra: '¡Compra realizada con éxito! Podés consultar el estado de tu pedido en Mis pedidos.',
                    },
                })
            } catch (error) {
                setErrorGeneral(handleApiError(error))
            }
        },
    })

    if (items.length === 0) {
        return (
            <section className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Confirmar compra
                </h1>

                <EstadoVacio mensaje="No hay productos para confirmar la compra." />

                <Link to="/productos" className="self-start">
                    <Button>Volver al catálogo</Button>
                </Link>
            </section>
        )
    }

    return (
        <section className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Confirmar compra
                </h1>
                <p className="mt-1 text-gray-600">
                    Completá los datos para realizar tu pedido.
                </p>
            </div>

            <Card className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">Resumen de compra</h2>

                {items.map((item) => (
                    <div
                        key={item.producto_id}
                        className="flex justify-between gap-4 text-sm"
                    >
            <span>
              {item.nombre} x {item.cantidad}
            </span>
                        <span className="font-medium">
              ${(item.precio * item.cantidad).toFixed(2)}
            </span>
                    </div>
                ))}

                <div className="flex justify-between border-t pt-3 font-bold">
                    <span>Total</span>
                    <span>${total().toFixed(2)}</span>
                </div>
            </Card>

            <Card>
                <form
                    className="flex flex-col gap-5"
                    onSubmit={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        void form.handleSubmit()
                    }}
                >
                    <h2 className="text-lg font-semibold">
                        Datos de entrega
                    </h2>

                    <form.Field
                        name="direccion_entrega"
                        validators={{
                            onChange: ({ value }) =>
                                value.trim().length < 5
                                    ? 'Ingresá una dirección de al menos 5 caracteres.'
                                    : undefined,
                            onSubmit: ({ value }) =>
                                value.trim().length < 5
                                    ? 'Ingresá una dirección de al menos 5 caracteres.'
                                    : undefined,
                        }}
                    >
                        {(field) => (
                            <Input
                                label="Dirección de entrega"
                                name={field.name}
                                placeholder="Calle y número, localidad..."
                                value={field.state.value}
                                onChange={(event) =>
                                    field.handleChange(event.target.value)
                                }
                                onBlur={field.handleBlur}
                                error={field.state.meta.errors[0] as string | undefined}
                            />
                        )}
                    </form.Field>

                    <form.Field name="forma_pago">
                        {(field) => (
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="forma_pago"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Forma de pago
                                </label>

                                <select
                                    id="forma_pago"
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value as FormaPago)
                                    }
                                    className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                </select>
                            </div>
                        )}
                    </form.Field>

                    <form.Field name="notas">
                        {(field) => (
                            <div className="flex flex-col gap-1">
                                <label
                                    htmlFor="notas"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Notas (opcional)
                                </label>

                                <textarea
                                    id="notas"
                                    name={field.name}
                                    value={field.state.value}
                                    onChange={(event) =>
                                        field.handleChange(event.target.value)
                                    }
                                    rows={3}
                                    placeholder="Indicaciones adicionales para la entrega..."
                                    className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </form.Field>

                    {errorGeneral && (
                        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {errorGeneral}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={crearPedido.isPending}
                        className="w-full"
                    >
                        {crearPedido.isPending
                            ? 'Procesando pedido...'
                            : 'Confirmar pedido'}
                    </Button>
                </form>
            </Card>
        </section>
    )
}
