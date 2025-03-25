import React, { useState, useEffect } from 'react'
import { submitAnswers } from '../services/api'
import { useLocation, useNavigate } from 'react-router-dom'

function ExamForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const { employee, taskIndex = 0 } = location.state || {}
  const [responses, setResponses] = useState([])
  const [exam, setExam] = useState(null)
  const [message, setMessage] = useState("")

  // Simulación: examen de ejemplo. En un entorno real, se cargaría el examen del backend.
  const dummyExam = {
    preguntas: [
      {
        pregunta: "¿Cuál es la función principal de asistir en el desarrollo de módulos de software?",
        opciones: { A: "Opción 1", B: "Opción 2", C: "Opción 3", D: "Opción 4" },
        respuesta_correcta: "B"
      },
      {
        pregunta: "¿Qué tarea es fundamental en la fase de pruebas?",
        opciones: { A: "Diseñar interfaz", B: "Realizar pruebas unitarias", C: "Planificar", D: "Depurar" },
        respuesta_correcta: "B"
      },
      {
        pregunta: "¿Cuál es la importancia de la documentación?",
        opciones: { A: "Facilitar mantenimiento", B: "Aumentar complejidad", C: "Reducir seguridad", D: "Ninguna" },
        respuesta_correcta: "A"
      },
      {
        pregunta: "¿Qué herramienta se usa para depurar?",
        opciones: { A: "Editor de texto", B: "Depurador", C: "Navegador", D: "Calculadora" },
        respuesta_correcta: "B"
      },
      {
        pregunta: "¿Qué acción demuestra buena asistencia?",
        opciones: { A: "Ignorar problemas", B: "Retroalimentación constructiva", C: "Cambiar código sin aviso", D: "No participar" },
        respuesta_correcta: "B"
      }
    ],
    comentarios: ""
  }

  useEffect(() => {
    // En una implementación real, se obtendría el examen del backend.
    setExam(dummyExam)
    setResponses(new Array(dummyExam.preguntas.length).fill(""))
  }, [])

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
      setTimeout(() => {
        navigate('/onboarding')
      }, 3000)
    } catch (error) {
      console.error(error)
      setMessage("Error enviando respuestas")
    }
  }

  if (!exam) return <p>Cargando examen...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Examen de Tarea</h1>
      <form onSubmit={handleSubmit}>
        {exam.preguntas.map((q, idx) => (
          <div key={idx} className="mb-4">
            <p className="font-semibold">{q.pregunta}</p>
            <div className="grid grid-cols-2 gap-2">
              {["A", "B", "C", "D"].map((option) => (
                <label key={option} className="border p-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={option}
                    checked={responses[idx] === option}
                    onChange={() => handleResponseChange(idx, option)}
                    className="mr-2"
                  />
                  {option}: {q.opciones[option]}
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


