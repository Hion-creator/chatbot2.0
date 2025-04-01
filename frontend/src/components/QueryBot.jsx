import React, { useState } from "react";
import { getGeneralQuery, getTaskQuery } from "../services/api";

function QueryBot() {
  const [view, setView] = useState("general"); // Estado para cambiar entre vistas
  const [generalQuery, setGeneralQuery] = useState("");
  const [generalResponse, setGeneralResponse] = useState("");
  const [taskEmployeeName, setTaskEmployeeName] = useState("");
  const [taskIndex, setTaskIndex] = useState(0);
  const [taskQuery, setTaskQuery] = useState("");
  const [taskResponse, setTaskResponse] = useState("");

  const handleGeneralQuery = async () => {
    try {
      const res = await getGeneralQuery({ query: generalQuery });
      setGeneralResponse(res.response);
    } catch (error) {
      setGeneralResponse(`Error: ${error.message}`);
    }
  };

  const handleTaskQuery = async () => {
    try {
      const res = await getTaskQuery({
        employee_name: taskEmployeeName,
        task_index: taskIndex,
        query: taskQuery,
      });
      setTaskResponse(res.response);
    } catch (error) {
      setTaskResponse(`Error consultando información de la tarea${error}`)
    }
  };

  return (
   
    <div className="flex flex-col items-center justify-start h-screen bg-white pt-6 mt-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">ChatBot de Consultas</h1>

      {/* Botón para alternar entre vistas */}
      <button
        onClick={() => setView(view === "general" ? "task" : "general")}
        className="mb-6 bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition-transform transform hover:scale-105 hover:bg-blue-700"
      >
        {view === "general" ? "Ir a Consultas de Tareas" : "Ir a Consultas Generales"}
      </button>

      <div className="relative w-full max-w-lg">
        {/* Vista de consulta general */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            view === "general" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Consulta General</h2>
            <input
              type="text"
              placeholder="Escribe tu consulta..."
              value={generalQuery}
              onChange={(e) => setGeneralQuery(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md mb-4 focus:ring focus:ring-blue-300"
            />
            <button
              onClick={handleGeneralQuery}
              className="w-full bg-blue-600 text-white py-2 rounded-md transition-transform hover:scale-105 hover:bg-blue-700"
            >
              Enviar Consulta
            </button>
            {generalResponse && (
              <p className="mt-4 text-gray-700 font-medium">{generalResponse}</p>
            )}
          </div>
        </div>

        {/* Vista de consulta de tareas */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            view === "task" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white p-6 shadow-lg rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Consulta de Tareas</h2>
            <input
              type="text"
              placeholder="Nombre del empleado"
              value={taskEmployeeName}
              onChange={(e) => setTaskEmployeeName(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md mb-3 focus:ring focus:ring-blue-300"
            />
            <input
              type="number"
              placeholder="Índice de tarea"
              value={taskIndex}
              onChange={(e) => setTaskIndex(Number(e.target.value))}
              className="w-full border border-gray-300 p-2 rounded-md mb-3 focus:ring focus:ring-blue-300"
            />
            <input
              type="text"
              placeholder="Consulta sobre la tarea..."
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md mb-4 focus:ring focus:ring-blue-300"
            />
            <button
              onClick={handleTaskQuery}
              className="w-full bg-blue-600 text-white py-2 rounded-md transition-transform hover:scale-105 hover:bg-blue-700"
            >
              Enviar Consulta de Tarea
            </button>
            {taskResponse && (
              <p className="mt-4 text-red-700 font-medium text-center">{taskResponse}</p>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default QueryBot;

