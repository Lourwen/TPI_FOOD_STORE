
interface PaginacionProps {
    paginaActual: number
    totalPaginas: number
    onCambiarPagina: (pagina: number) => void
}

export function Paginacion({
                               paginaActual,
                               totalPaginas,
                               onCambiarPagina,
                           }: PaginacionProps) {
    if (totalPaginas <= 1) return null

    return (
        <nav
            aria-label="Paginación"
            className="flex items-center justify-center gap-4"
        >
            <button
                type="button"
                onClick={() => onCambiarPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
                Anterior
            </button>

            <span className="text-sm text-gray-700">
        Página {paginaActual} de {totalPaginas}
      </span>

            <button
                type="button"
                onClick={() => onCambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
                Siguiente
            </button>
        </nav>
    )
}
