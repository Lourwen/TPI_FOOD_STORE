
interface EstadoErrorProps {
    mensaje?: string
    onReintentar?: () => void
}

export function EstadoError({
                                mensaje = 'No se pudieron cargar los datos.',
                                onReintentar,
                            }: EstadoErrorProps) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center"
        >
            <p className="text-red-700">{mensaje}</p>

            {onReintentar && (
                <button
                    type="button"
                    onClick={onReintentar}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Reintentar
                </button>
            )}
        </div>
    )
}
