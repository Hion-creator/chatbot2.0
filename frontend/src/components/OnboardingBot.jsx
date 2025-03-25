import React, { useEffect, useState } from 'react'
import { getEmployees, requestOnboarding, confirmOnboarding } from '../services/api'
import { useNavigate } from 'react-router-dom'

function OnboardingBot() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [claveInput, setClaveInput] = useState("")
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState("iniciar") // "iniciar" o "info"
  const [conversation, setConversation] = useState([]) // Para el chat
  const [question, setQuestion] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await getEmployees()
        setEmployees(data.employees)
      } catch (error) {
        console.error("Error fetching employees", error)
      }
    }
    fetchEmployees()
  }, [])

  // Simulación de respuesta de IA para consultas sobre la tarea
  const askTaskInfo = async (q) => {
    // Aquí se integraría un endpoint real, por ahora se simula:
    return `Respuesta simulada para: "${q}"`
  }

  const handleSendQuestion = async () => {
    if (!question.trim()) return
    setConversation(prev => [...prev, { sender: 'empleado', text: question }])
    try {
      const answer = await askTaskInfo(question)
      setConversation(prev => [...prev, { sender: 'bot', text: answer }])
    } catch (error) {
      setConversation(prev => [...prev, { sender: 'bot', text: `No se pudo obtener respuesta.${error}` }])
    }
    setQuestion("")
  }

  const handleSelect = async (emp) => {
    setSelectedEmployee(emp)
    try {
      const res = await requestOnboarding({ employee_name: emp.nombre })
      setMessage(res.message)
    } catch (error) {
      console.error(error)
      setMessage(`Error solicitando clave${error}`)
    }
  }

  const handleConfirm = async () => {
    if (!selectedEmployee) return
    try {
      const res = await confirmOnboarding({
        employee_name: selectedEmployee.nombre,
        clave: claveInput
      })
      setMessage(res.message)
    } catch (error) {
      console.error(error)
      setMessage(`Error confirmando onboarding ${error}`)
    }
  }

  const handleStartExam = () => {
    // Redirige al formulario de examen para la tarea actual
    navigate('/exam', { state: { employee: selectedEmployee, taskIndex: 0 } })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Onboarding Bot</h1>
      <div className="mb-4">
        <button onClick={() => setMode("info")} className="mr-2 bg-gray-500 text-white p-2 rounded">
          Consultar Tarea
        </button>
        <button onClick={() => setMode("iniciar")} className="bg-purple-500 text-white p-2 rounded">
          Iniciar Onboarding
        </button>
      </div>

      {mode === "info" && (
        <div className="mb-4">
          <h2 className="font-bold mb-2">Preguntas sobre la tarea</h2>
          <div className="border p-4 rounded mb-4 h-40 overflow-auto">
            {conversation.length === 0 ? (
              <p className="text-gray-500">Aquí aparecerán tus preguntas y respuestas.</p>
            ) : (
              conversation.map((msg, idx) => (
                <p key={idx} className={msg.sender === 'bot' ? "text-blue-600" : "text-black"}>
                  <strong>{msg.sender === 'bot' ? "Bot:" : "Tú:"}</strong> {msg.text}
                </p>
              ))
            )}
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border p-2 flex-1 mr-2"
            />
            <button onClick={handleSendQuestion} className="bg-blue-500 text-white p-2 rounded">
              Enviar
            </button>
          </div>
          <button onClick={() => setMode("iniciar")} className="mt-4 bg-green-500 text-white p-2 rounded w-full">
            Volver a iniciar Onboarding
          </button>
        </div>
      )}

      {mode === "iniciar" && (
        <div>
          <p className="mb-2">Selecciona un empleado para iniciar su onboarding:</p>
          <ul>
            {employees.map((emp) => (
              <li 
                key={emp.doc_id} 
                className="p-2 border my-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(emp)}
              >
                {emp.nombre} - {emp.cargo}
              </li>
            ))}
          </ul>
          {selectedEmployee && (
            <div className="mt-4">
              <h2 className="font-bold">Empleado seleccionado: {selectedEmployee.nombre}</h2>
              <p>{message}</p>
              <input
                type="text"
                placeholder="Ingresa la clave recibida"
                value={claveInput}
                onChange={(e) => setClaveInput(e.target.value)}
                className="border p-2 my-2 w-full"
              />
              <button onClick={handleConfirm} className="bg-blue-500 text-white p-2 rounded w-full">
                Confirmar Onboarding
              </button>
              {message.toLowerCase().includes("confirmado") && (
                <button onClick={handleStartExam} className="mt-4 bg-green-500 text-white p-2 rounded w-full">
                  Listo para iniciar el examen de la tarea
                </button>
              )}
              <button onClick={() => setMode("info")} className="mt-4 bg-gray-500 text-white p-2 rounded w-full">
                Consultar información sobre la tarea
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OnboardingBot







