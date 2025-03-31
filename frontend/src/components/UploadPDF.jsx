import React, { useState } from 'react'
import { uploadPDF } from '../services/api'
import { useNavigate } from 'react-router-dom'

function UploadPDF() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [uploaded, setUploaded] = useState(false)
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
      setUploaded(true)
    } catch (error) {
      console.error(error)
      setMessage("Error subiendo el PDF")
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files.length) {
      setFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="flex flex-col items-center bg-white shadow-lg rounded-2xl p-6 w-100 mx-auto text-center font-semibold mt-10">
      <h1 className="text-xl font-bold text-gray-800 mb-8">📃 Subir PDF de Onboarding</h1>
      <p className="text-gray-500 mb-4">
        Carga el PDF de onboarding aquí.
      </p>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center text-center">
        <div 
          className="w-full bg-gray-100 border-dashed border-2 border-gray-300 rounded-xl p-12 flex flex-col items-center cursor-pointer"
          onClick={() => document.getElementById('fileInput').click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" accept="application/pdf" />
          {file ? <p className="text-gray-500">{file.name}</p> : <p className="text-gray-500">Arrastre o seleccione el PDF.</p>}
        </div>
        <button id="PdfUp" type="submit" className="mt-4 w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 hover:bg-blue-700">
          Subir
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
      {uploaded && (
        <button onClick={() => navigate('/metrics')} className="mt-4 w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 hover:bg-blue-700">
          Métricas
        </button>
      )}
    </div>
  )
}

export default UploadPDF




