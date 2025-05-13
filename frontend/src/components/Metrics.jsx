import React, { useEffect, useState } from 'react'
import { getMetrics } from '../services/api'
import { BarChart3 } from 'lucide-react'

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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-500" /> Métricas de Onboarding
        </h1>

        {metrics.length === 0 ? (
          <p className="text-gray-500 text-center">No hay datos disponibles.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="py-3 px-4 text-left border-b">Empleado</th>
                  <th className="py-3 px-4 text-left border-b">Estado</th>
                  <th className="py-3 px-4 text-left border-b">Fecha Inicio</th>
                  <th className="py-3 px-4 text-left border-b">Fecha Fin</th>
                  <th className="py-3 px-4 text-left border-b">Evaluaciones</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((emp) => (
                  <tr key={emp.doc_id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-4 border-b">{emp.nombre}</td>
                    <td className={`py-2 px-4 border-b font-medium ${emp.estado === 'Completado' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {emp.estado}
                    </td>
                    <td className="py-2 px-4 border-b">{emp.fecha_inicio || "-"}</td>
                    <td className="py-2 px-4 border-b">{emp.fecha_fin || "-"}</td>
                    <td className="py-2 px-4 border-b text-sm text-gray-700">
                      {emp.evaluaciones && emp.evaluaciones.length > 0
                        ? emp.evaluaciones.map((ev, idx) => (
                            <div key={idx}>✅ {ev}</div>
                          ))
                        : "Sin evaluación"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Metrics


