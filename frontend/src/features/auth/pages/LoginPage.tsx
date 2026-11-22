
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { handleApiError } from '../../../shared/api/handleApiError'

export function LoginPage() {
    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setEnviando(true)

        try {
            await login(username, password)
            navigate('/productos')
        } catch (error) {
            setError(handleApiError(error))
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
                <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
                    Iniciar sesión
                </h1>

                <p className="mb-6 text-center text-sm text-gray-500">
                    Ingresá a tu cuenta de Food Store
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Usuario"
                        name="username"
                        type="text"
                        placeholder="Ingresá tu usuario"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />

                    <Input
                        label="Contraseña"
                        name="password"
                        type="password"
                        placeholder="Ingresá tu contraseña"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <Button type="submit" disabled={enviando} className="w-full">
                        {enviando ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿Todavía no tenés cuenta?{' '}
                    <Link to="/registro" className="font-medium text-blue-600 hover:underline">
                        Registrate
                    </Link>
                </p>
            </div>
        </div>
    )
}
