
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../../shared/api/axiosInstance'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'

interface RegistroDatos {
    username: string
    full_name: string
    email: string
    password: string
}

export function RegisterPage() {
    const navigate = useNavigate()

    const [datos, setDatos] = useState<RegistroDatos>({
        username: '',
        full_name: '',
        email: '',
        password: '',
    })

    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)

    const handleChange = (campo: keyof RegistroDatos, valor: string) => {
        setDatos((actuales) => ({
            ...actuales,
            [campo]: valor,
        }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setEnviando(true)

        try {
            await axiosInstance.post('/auth/register', datos)
            navigate('/login')
        } catch (error) {
            setError(handleApiError(error))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
                    Crear cuenta
                </h1>

                <p className="mb-6 text-center text-sm text-gray-500">
                    Registrate en Food Store
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Nombre completo"
                        name="full_name"
                        value={datos.full_name}
                        onChange={(event) => handleChange('full_name', event.target.value)}
                        required
                    />

                    <Input
                        label="Nombre de usuario"
                        name="username"
                        value={datos.username}
                        onChange={(event) => handleChange('username', event.target.value)}
                        required
                    />

                    <Input
                        label="Correo electrónico"
                        name="email"
                        type="email"
                        value={datos.email}
                        onChange={(event) => handleChange('email', event.target.value)}
                        required
                    />

                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        value={datos.password}
                        onChange={(event) => handleChange('password', event.target.value)}
                        required
                    />

                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <Button type="submit" disabled={enviando} className="w-full">
                        {enviando ? 'Registrando...' : 'Crear cuenta'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tenés cuenta?{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:underline">
                        Iniciá sesión
                    </Link>
                </p>
            </div>
        </div>
    )
}
