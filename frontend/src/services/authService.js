import { BASE_URL } from '../config'

export async function login(credentials) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })
    if (!res.ok) throw new Error('Error en login')
    return res.json()
}