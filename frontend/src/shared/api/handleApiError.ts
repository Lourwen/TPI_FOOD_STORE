
import axios from 'axios'

interface ApiErrorDetail {
    msg?: string
}

interface ApiErrorResponse {
    detail?: string | ApiErrorDetail[]
}

export function handleApiError(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
        const detail = error.response?.data?.detail

        if (typeof detail === 'string') {
            return detail
        }

        if (Array.isArray(detail)) {
            return detail
                .map((item) => item.msg ?? 'Error de validación')
                .join('. ')
        }

        if (!error.response) {
            return 'No se pudo conectar con el servidor.'
        }
    }

    return 'Ocurrió un error inesperado.'
}
