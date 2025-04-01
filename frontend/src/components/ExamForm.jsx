import React, { useState, useEffect } from 'react';
import { submitAnswers } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';

function ExamForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee, taskIndex = 0 } = location.state || {};
  const [responses, setResponses] = useState([]);
  const [exam, setExam] = useState(null);
  const [message, setMessage] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);

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
  };

  useEffect(() => {
    setExam(dummyExam);
    setResponses(new Array(dummyExam.preguntas.length).fill(""));
  }, []);

  const handleResponseChange = (value) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (!responses[currentQuestion]) return;
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    setMessage("");

    try {
      const res = await submitAnswers({
        employee_name: employee.nombre,
        task_index: taskIndex,
        respuestas: responses
      });
      setMessage(`Puntaje: ${res.puntaje}% (Correctas: ${res.correctas} de ${res.total_preguntas})`);
      setTimeout(() => navigate('/onboarding'), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error al enviar respuestas");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam) return <p className="text-center text-gray-500">Cargando examen...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden w-full mt-10">
      <div className="relative w-full h-2 bg-gray-300 rounded-full overflow-hidden mb-6">
        <div className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-500" style={{ width: `${((currentQuestion + 1) / exam.preguntas.length) * 100}%` }}></div>
      </div>
      <h1 className="text-3xl font-extrabold text-blue-600 text-center mb-6">Evaluación Técnica</h1>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 shadow rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-700 text-center">{exam.preguntas[currentQuestion].pregunta}</h2>
        <div className="space-y-2">
          {Object.entries(exam.preguntas[currentQuestion].opciones).map(([key, value]) => (
            <label key={key} className={`block p-3 border rounded-lg cursor-pointer transition-all text-lg font-medium ${responses[currentQuestion] === key ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={key}
                checked={responses[currentQuestion] === key}
                onChange={() => handleResponseChange(key)}
                className="hidden"
              />
              {key}: {value}
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          {currentQuestion > 0 && (
            <button
              type="button"
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Anterior
            </button>
          )}
          {currentQuestion < exam.preguntas.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!responses[currentQuestion]}
              className={`px-4 py-2 rounded-lg text-white ${responses[currentQuestion] ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              className={`ml-50 w-full font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
            >
              {isSubmitting ? "Enviando..." : isError ? "Error al enviar" : "Enviar Respuestas"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ExamForm;




