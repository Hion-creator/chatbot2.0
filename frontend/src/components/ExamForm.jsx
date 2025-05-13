import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { submitAnswers } from '../services/api'

function ExamForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { employee, taskIndex = 0, examen } = location.state || {}
  const [responses, setResponses] = useState(new Array(examen?.preguntas?.length || 0).fill(""))
  const [message, setMessage] = useState("")

  const handleResponseChange = (index, value) => {
    const newResponses = [...responses]
    newResponses[index] = value
    setResponses(newResponses)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await submitAnswers({
        employee_name: employee.nombre,
        task_index: taskIndex,
        respuestas: responses
      })
      setMessage(`Puntaje: ${res.puntaje}% (Correctas: ${res.correctas} de ${res.total_preguntas})`)
      setTimeout(() => navigate('/onboarding'), 3000)
    } catch (err) {
      setMessage("Error enviando respuestas",err)
    }
  }

  if (!examen) return <p>No se ha proporcionado examen.</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Examen</h1>
      <form onSubmit={handleSubmit}>
        {examen.preguntas.map((q, idx) => (
          <div key={idx} className="mb-4">
            <p className="font-semibold">{q.pregunta}</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(q.opciones).map(([key, val]) => (
                <label key={key} className="border p-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={key}
                    checked={responses[idx] === key}
                    onChange={() => handleResponseChange(idx, key)}
                    className="mr-2"
                  />
                  {key}: {val}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button type="submit" className="bg-green-500 text-white p-2 rounded w-full">
          Enviar Respuestas
        </button>
      </form>
      {message && <p className="mt-4 font-bold">{message}</p>}
    </div>
  )
}

export default ExamForm


