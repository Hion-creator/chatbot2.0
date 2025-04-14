import React, { useEffect, useState } from 'react'
import { getMetrics } from '../services/api'

function Metrics() {
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const data = await getMetrics()
        setMetrics(data.metrics)
      } catch (error) {
        console.error("Error fetching metrics", error)
      }
    }
    fetchMetrics()
  }, [])

  return (
    <div className="p-6 w-[98%] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#FFFFFF] rounded-lg shadow-lg bg-opacity-50">
      <h1 className="text-4xl font-extrabold mb-6 text-[#1E3A8A] text-center tracking-wide">
        Métricas de Onboarding
      </h1>

      {metrics.length === 0 ? (
        <p className="text-center text-[#6B7280] text-lg">No hay datos disponibles.</p>
      ) : (
        <div className="overflow-x-auto max-h-[540px] rounded-xl bg-white shadow-md">
          <table className="min-w-full border-collapse table-auto text-sm text-[#374151]">
            <thead className="bg-[#1E3A8A] text-white sticky top-0 z-10">
              <tr>
                <th className="border-b border-[#E5E7EB] p-3 text-left">Empleado</th>
                <th className="border-b border-[#E5E7EB] p-3 text-left">Estado</th>
                <th className="border-b border-[#E5E7EB] p-3 text-left">Fecha Inicio</th>
                <th className="border-b border-[#E5E7EB] p-3 text-left">Fecha Fin</th>
                <th className="border-b border-[#E5E7EB] p-3 text-left">Evaluaciones</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((emp, index) => (
                <tr
                  key={emp.doc_id || index}
                  className="hover:bg-[#F3F4F6] transition-colors"
                >
                  <td className="border-b border-[#E5E7EB] p-3">{emp.nombre}</td>
                  <td className="border-b border-[#E5E7EB] p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                          ${emp.estado === 'Completado'
                          ? 'bg-blue-500 text-white' 
                          : emp.estado === 'En Proceso'
                            ? 'bg-blue-100 text-blue-900'  
                            : 'bg-gray-400 text-white'  
                        }`}
                    >
                      {emp.estado}
                    </span>
                  </td>
                  <td className="border-b border-[#E5E7EB] p-3">{emp.fecha_inicio || '-'}</td>
                  <td className="border-b border-[#E5E7EB] p-3">{emp.fecha_fin || '-'}</td>
                  <td className="border-b border-[#E5E7EB] p-3 text-[#6B7280]">
                    {emp.evaluaciones && emp.evaluaciones.length > 0
                      ? JSON.stringify(emp.evaluaciones)
                      : 'Sin evaluación'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Metrics