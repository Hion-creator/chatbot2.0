import React, { useState } from 'react'
import { uploadPDF } from '../services/api'
import { useNavigate } from 'react-router-dom'

function UploadPDF() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return
    try {
      const res = await uploadPDF(file)
      setMessage(`Se extrajeron ${res.empleados_registrados} empleados.`)
    } catch (error) {
      console.error(error)
      setMessage("Error subiendo el PDF")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subir PDF de Onboarding</h1>
      <p className="mb-4">
        Aquí podrás cargar el PDF que contiene la información de los empleados para el onboarding.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <input type="file" onChange={handleFileChange} className="mb-4" accept="application/pdf" />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Subir PDF
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
      <button onClick={() => navigate('/metrics')} className="mt-4 bg-blue-500 text-white p-2 rounded">
        Ver Métricas
      </button>
    </div>
  )
}

export default UploadPDF




