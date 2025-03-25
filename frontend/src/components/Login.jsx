import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

function Login() {
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ company_name: companyName, password })
      localStorage.setItem('token', res.access_token)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Error de autenticación')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4">Iniciar Sesión</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input 
          type="text" 
          placeholder="Nombre de la Empresa" 
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Ingresar
        </button>
      </form>
    </div>
  )
}

export default Login



