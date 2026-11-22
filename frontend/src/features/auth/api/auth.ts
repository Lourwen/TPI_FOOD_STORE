
import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../types'

interface LoginResponse {
    access_token: string
    token_type: string
}

interface LoginCredentials {
    username: string
    password: string
}

export async function loginRequest(
    credentials: LoginCredentials,
): Promise<void> {
    const body = new URLSearchParams()
    body.append('username', credentials.username)
    body.append('password', credentials.password)

    await axiosInstance.post<LoginResponse>('/auth/token', body, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })
}

export async function getCurrentUser(): Promise<Usuario> {
    const response = await axiosInstance.get<Usuario>('/auth/me')
    return response.data
}

export async function logoutRequest(): Promise<void> {
    await axiosInstance.post('/auth/logout')
}
