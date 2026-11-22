
interface EstadoVacioProps {
    mensaje?: string
}

export function EstadoVacio({
                                mensaje = 'No hay datos para mostrar.',
                            }: EstadoVacioProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">{mensaje}</p>
        </div>
    )
}
