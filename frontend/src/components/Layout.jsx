import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FileUp, LineChart, Bot, Search } from 'lucide-react';

function Layout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E1E2D] flex flex-col p-6">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-purple-400">Lia</h2>
          <p className="text-sm text-gray-400 mt-1">Tu asistente virtual</p>
        </div>
        
        <nav className="flex flex-col space-y-2">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2D2D44] transition-colors"
          >
            <FileUp className="w-6 h-6 text-purple-300" />
            <span className='text-sm mt-1'>Subir PDF y Explicación</span>
          </button>
          <button
            onClick={() => navigate('/metrics')}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2D2D44] transition-colors"
          >
            <LineChart className="w-6 h-6 text-purple-300" />
            <span className='text-sm mt-1'>Ver Métricas</span>
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2D2D44] transition-colors"
          >
            <Bot className="w-6 h-6 text-purple-300" />
            <span className='text-sm mt-1'>Iniciar Onboarding Bot</span>
          </button>
          <button
            onClick={() => navigate('/query')}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2D2D44] transition-colors"
          >
            <Search className="w-6 h-6 text-purple-300" />
            <span className='text-sm mt-1'>Consultas Generales</span>
          </button>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-8 bg-gray-800 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

