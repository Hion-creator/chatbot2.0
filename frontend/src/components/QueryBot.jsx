import React, { useState } from 'react'
import { getGeneralQuery, getTaskQuery } from '../services/api'

function QueryBot() {
  const [generalQuery, setGeneralQuery] = useState("")
  const [generalResponse, setGeneralResponse] = useState("")
  const [taskEmployeeName, setTaskEmployeeName] = useState("")
  const [taskIndex, setTaskIndex] = useState(0)
  const [taskQuery, setTaskQuery] = useState("")
  const [taskResponse, setTaskResponse] = useState("")

  const handleGeneralQuery = async () => {
    try {
      const res = await getGeneralQuery({ query: generalQuery })
      setGeneralResponse(res.response)
    } catch (error) {
      setGeneralResponse(`Error consultando información${error}`)
    }
  }

  const handleTaskQuery = async () => {
    try {
      const res = await getTaskQuery({ 
        employee_name: taskEmployeeName, 
        task_index: taskIndex, 
        query: taskQuery 
      })
      setTaskResponse(res.response)
    } catch (error) {
      setTaskResponse(`Error consultando información de la tarea${error}`)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Consulta de Información</h1>

      <div className="mb-8 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Consulta General sobre la Empresa</h2>
        <input 
          type="text" 
          placeholder="Escribe tu consulta sobre la empresa..."
          value={generalQuery}
          onChange={(e) => setGeneralQuery(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button 
          onClick={handleGeneralQuery} 
          className="bg-blue-500 text-white p-2 rounded"
        >
          Enviar Consulta
        </button>
        {generalResponse && (
          <p className="mt-4 font-semibold">Respuesta: {generalResponse}</p>
        )}
      </div>

      <div className="border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Consulta sobre una Tarea</h2>
        <input 
          type="text" 
          placeholder="Nombre del empleado"
          value={taskEmployeeName}
          onChange={(e) => setTaskEmployeeName(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <input 
          type="number" 
          placeholder="Índice de tarea (0-indexed)"
          value={taskIndex}
          onChange={(e) => setTaskIndex(Number(e.target.value))}
          className="border p-2 w-full mb-2"
        />
        <input 
          type="text" 
          placeholder="Consulta sobre la tarea..."
          value={taskQuery}
          onChange={(e) => setTaskQuery(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button 
          onClick={handleTaskQuery} 
          className="bg-blue-500 text-white p-2 rounded"
        >
          Enviar Consulta de Tarea
        </button>
        {taskResponse && (
          <p className="mt-4 font-semibold">Respuesta: {taskResponse}</p>
        )}
      </div>
    </div>
  )
}

export default QueryBot

