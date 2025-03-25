import React from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => navigate('/upload')}
          className="bg-green-500 text-white p-4 rounded"
        >
          Subir PDF y Explicación
        </button>
        <button 
          onClick={() => navigate('/metrics')}
          className="bg-blue-500 text-white p-4 rounded"
        >
          Ver Métricas
        </button>
        <button 
          onClick={() => navigate('/onboarding')}
          className="bg-purple-500 text-white p-4 rounded"
        >
          Iniciar Onboarding Bot
        </button>
        <button 
          onClick={() => navigate('/query')}
          className="bg-gray-500 text-white p-4 rounded"
        >
          Consultas Generales
        </button>
      </div>
    </div>
  )
}

export default Dashboard



