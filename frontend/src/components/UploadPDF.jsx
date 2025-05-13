import React, { useState } from 'react'
import { uploadPDF } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { FileUp, LineChart } from 'lucide-react'

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
      setMessage(`✅ Se extrajeron ${res.empleados_registrados} empleados.`)
    } catch (error) {
      console.error(error)
      setMessage("❌ Error subiendo el PDF")
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-semibold mb-2 text-gray-800 flex items-center gap-2">
          <FileUp className="text-green-500" /> Subir PDF de Onboarding
        </h1>
        <p className="text-gray-600 mb-6">
          Carga el archivo PDF que contiene la información de empleados. El sistema procesará automáticamente los datos.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer text-center hover:border-green-400 hover:bg-green-50 transition">
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="application/pdf" 
              className="hidden"
            />
            {file ? (
              <span className="text-green-600 font-medium">{file.name}</span>
            ) : (
              <span className="text-gray-400">Haz clic o arrastra un archivo PDF aquí</span>
            )}
          </label>

          <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition">
            Subir PDF
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700 bg-gray-100 rounded p-3">{message}</p>
        )}

        <div className="mt-6">
          <button 
            onClick={() => navigate('/metrics')} 
            className="inline-flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            <LineChart size={18} /> Ver Métricas
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadPDF





