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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Métricas de Onboarding</h1>
      {metrics.length === 0 ? (
        <p>No hay datos disponibles.</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">Empleado</th>
              <th className="border p-2">Estado</th>
              <th className="border p-2">Fecha Inicio</th>
              <th className="border p-2">Fecha Fin</th>
              <th className="border p-2">Evaluaciones</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((emp) => (
              <tr key={emp.doc_id}>
                <td className="border p-2">{emp.nombre}</td>
                <td className="border p-2">{emp.estado}</td>
                <td className="border p-2">{emp.fecha_inicio || "-"}</td>
                <td className="border p-2">{emp.fecha_fin || "-"}</td>
                <td className="border p-2">
                  {emp.evaluaciones && emp.evaluaciones.length > 0 ? (
                    JSON.stringify(emp.evaluaciones)
                  ) : (
                    "Sin evaluación"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Metrics


