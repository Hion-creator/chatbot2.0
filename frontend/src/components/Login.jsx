import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

function Login() {
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    setError('')
  }, [companyName, password])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/menu')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ company_name: companyName, password })
      localStorage.setItem('token', res.access_token)
      localStorage.setItem("empresa", res.company_name);
      navigate('/menu')
    } catch (err) {
      console.error(err)
      setError('Error de autenticación')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex w-[900px] h-[500px]">

        {/* Sección derecha (Bienvenida) */}
        <div className="w-3/5 bg-gradient-to-br from-blue-700 to-blue-500 text-white flex flex-col items-center justify-center rounded-lg p-8 ml-100">
          <h2 className="text-3xl font-bold">¡Bienvenido!</h2>
          <p className="mt-2 text-sm">Ingresa tus datos y comienza tu experiencia con nosotros.</p>

        </div>

        <div className="absolute left-[30%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 w-2/5 bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-xl font-semibold text-gray-900 text-center mb-6">Iniciar Sesión</h1>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Nombre de la Empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="relative mb-3">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                className="absolute right-3  text-gray-600 top-1/3 "
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '✖' : '👁'}
              </button>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 hover:bg-blue-700">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login