import React, { useState } from 'react'
import { chatbotInteraction, evaluateOnboarding } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { Bot } from 'lucide-react'

function OnboardingBot() {
  const [conversation, setConversation] = useState([])
  const [input, setInput] = useState("")
  const [employeeName, setEmployeeName] = useState("")
  const navigate = useNavigate()

  const handleSend = async () => {
    if (!input.trim()) return
    setConversation(prev => [...prev, { sender: 'user', text: input }])

    try {
      const res = await chatbotInteraction({ message: input })
      const botReply = res.message || res.response || "Sin respuesta."
      setConversation(prev => [...prev, { sender: 'bot', text: botReply }])

      // Si el mensaje incluye "listo para el examen", intenta generar examen
      if (input.toLowerCase().includes("listo para el examen") && employeeName) {
        const examRes = await evaluateOnboarding({
          employee_name: employeeName,
          task_index: 0
        })
        navigate('/exam', {
          state: {
            employee: { nombre: employeeName },
            taskIndex: 0,
            examen: examRes.examen
          }
        })
      }

      // Extrae el nombre del empleado si lo detecta en el input
      if (input.toLowerCase().startsWith("mi nombre es ")) {
        const nombre = input.replace(/mi nombre es /i, '').trim()
        setEmployeeName(nombre)
      }

    } catch (error) {
      setConversation(prev => [...prev, { sender: 'bot', text: `Error en el servidor: ${error}` }])
    }
    setInput("")
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <Bot className="text-purple-500" /> Onboarding Bot
        </h1>

        <div className="border rounded-lg p-4 h-64 overflow-y-auto bg-gray-50 mb-4">
          {conversation.length === 0 ? (
            <p className="text-gray-500">Aquí aparecerán tus preguntas y respuestas.</p>
          ) : (
            conversation.map((msg, idx) => (
              <p key={idx} className={`mb-1 ${msg.sender === 'bot' ? "text-blue-600" : "text-gray-800"}`}>
                <strong>{msg.sender === 'bot' ? "Bot:" : "Tú:"}</strong> {msg.text}
              </p>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe tu mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border p-2 rounded flex-1 text-black"
          />
          <button onClick={handleSend} className="bg-purple-600 text-white px-4 py-2 rounded">
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingBot








