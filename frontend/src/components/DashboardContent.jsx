import React from "react";

function DashboardContent() {
  return (
    <div className="p-10 bg-gray-800">
      <h1 className="text-3xl font-semibold mb-6 text-white">¡Hola! Soy Lia 👋</h1>
      <p className="text-gray-400 mb-8 text-lg">
        Tu asistente virtual de onboarding y capacitación. Estoy aquí para ayudarte a que tus nuevos colaboradores aprendan de forma rápida, clara y divertida.
      </p>

      <h2 className="text-2xl font-bold text-purple-400 mb-4">¿Qué puedes hacer conmigo?</h2>
      <ul className="list-disc list-inside text-gray-300 space-y-2 mb-10">
        <li><span className="text-purple-300 font-semibold">📄 Subir documentos:</span> Carga tus PDFs y genera explicaciones automáticas para tus equipos.</li>
        <li><span className="text-purple-300 font-semibold">📊 Consultar métricas:</span> Analiza el progreso y detecta quién necesita refuerzo.</li>
        <li><span className="text-purple-300 font-semibold">🧠 Simulacros de examen:</span> Prepara a tus empleados con preguntas y escenarios reales.</li>
        <li><span className="text-purple-300 font-semibold">🤖 Onboarding Bot:</span> Deja que yo guíe a tus nuevos integrantes paso a paso.</li>
        <li><span className="text-purple-300 font-semibold">🔎 Consultas rápidas:</span> Accede a información de procesos y documentos en segundos.</li>
      </ul>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">📊 Resumen General</h2>
          <p className="text-sm text-gray-300">
            Un vistazo rápido al estado del onboarding y las métricas clave de tu equipo.
          </p>
        </div>
        <div className="bg-gray-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">📁 Últimos Documentos</h2>
          <p className="text-sm text-gray-300">
            Revisa los documentos más recientes que has cargado y sus explicaciones generadas.
          </p>
        </div>
        <div className="bg-gray-700 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2">🚀 Progreso de Nuevos Empleados</h2>
          <p className="text-sm text-gray-300">
            Descubre cómo avanzan tus equipos en el proceso de aprendizaje y adaptación.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;






