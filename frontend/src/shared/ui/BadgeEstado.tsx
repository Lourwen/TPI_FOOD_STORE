
interface BadgeEstadoProps {
    estado: string
}

const estilos: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    en_preparacion: 'bg-indigo-100 text-indigo-800',
    entregado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
}

const etiquetas: Record<string, string> = {
    pendiente: 'Pendiente',
    en_preparacion: 'En preparación',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
    const estadoNormalizado = estado.toLowerCase()

    const estilo =
        estilos[estadoNormalizado] ?? 'bg-gray-100 text-gray-800'

    const etiqueta =
        etiquetas[estadoNormalizado] ?? estadoNormalizado.replaceAll('_', ' ')

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${estilo}`}
        >
      {etiqueta}
    </span>
    )
}
