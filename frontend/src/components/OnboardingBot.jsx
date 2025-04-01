import React, { useEffect, useState, useRef } from 'react'
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
  const chatEndRef = useRef(null)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await getEmployees()
        setEmployees(data.employees)
      } catch (error) {
        console.error('Error fetching employees', error)
      }
    }
    fetchEmployees()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  const askTaskInfo = async (q) => {
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
    setQuestion('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendQuestion()
    }
  }

  const handleSelect = async (emp) => {
    setSelectedEmployee(emp)
    try {
      const res = await requestOnboarding({ employee_name: emp.nombre })
      setMessage(res.message)
    } catch (error) {
      console.error(error)
      setMessage(`Error solicitando clave: ${error}`)
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
      setMessage(`Error confirmando onboarding: ${error}`)
    }
  }

  const handleStartExam = () => {
    navigate('/exam', { state: { employee: selectedEmployee, taskIndex: 0 } })
  }

  return (
    <div className="mt-10 p-6 bg-white shadow-lg rounded-2xl mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Chat Onboarding</h1>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setMode('info')} className="bg-blue-600 text-white p-2 rounded flex-1 hover:bg-blue-700">Consultar Tarea</button>
        <button onClick={() => setMode('iniciar')} className="bg-blue-800 text-white p-2 rounded flex-1 hover:bg-blue-900">Iniciar Onboarding</button>
      </div>
      {mode === 'info' && (
        <div className="mb-4">
          <h2 className="font-bold mb-2">Preguntas sobre la tarea</h2>
          <div className="border border-blue-500 p-4 rounded mb-4 h-100 overflow-auto">
            {conversation.length === 0 ? (
              <p className="text-gray-500">Aquí aparecerán tus preguntas y respuestas.</p>
            ) : (
              conversation.map((msg, idx) => (
                <div key={idx} className="flex">
                  <div
                    className={`max-w-[75%] break-words p-3 rounded-lg my-1 ${msg.sender === 'bot'
                      ? 'bg-gray-100 text-black mr-auto'
                      : 'bg-blue-400 text-white ml-auto'
                      }`}
                  >
                    <strong>{msg.sender === 'bot' ? 'Bot:' : ''}</strong> {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              className="border border-blue-500 p-2 flex-1 mr-2 rounded focus:border-blue-500 focus:ring focus:ring-blue-500 focus:outline-none"
            />
            <button onClick={handleSendQuestion} className="bg-blue-600 text-white p-4 rounded hover:bg-blue700 text-lg w-1/4">Enviar</button>
          </div>
        </div>
      )}
      {mode === 'iniciar' && (
        <div>
          <p className="mb-2">Selecciona un empleado para iniciar su onboarding:</p>
          <ul>
            {employees.map((emp) => (
              <li key={emp.doc_id} className="p-2 border my-2 cursor-pointer hover:bg-gray-light rounded" onClick={() => handleSelect(emp)}>
                {emp.nombre} - {emp.cargo}
              </li>
            ))}
          </ul>
          {selectedEmployee && (
            <div className="mt-4">
              <h2 className="font-bold">Empleado seleccionado: {selectedEmployee.nombre}</h2>
              <p>{message}</p>
              <input type="text" placeholder="Ingresa la clave recibida" value={claveInput} onChange={(e) => setClaveInput(e.target.value)} className="border p-2 my-2 w-full rounded" />
              <button onClick={handleConfirm} className="bg-blue-600 text-white p-4 rounded w-full hover:bg-blue-700">Confirmar Onboarding</button>
              {message.toLowerCase().includes('confirmado') && (
                <button onClick={handleStartExam} className="mt-4 bg-primary-light text-white p-4 rounded w-full hover:bg-primary">Iniciar examen</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default OnboardingBot




