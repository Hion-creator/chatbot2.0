import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login({ company_name: companyName, password });
      localStorage.setItem('token', res.access_token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Error de autenticación. Verifica el nombre de la empresa y la contraseña.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="flex w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-[#1e293b]">
        {/* Izquierda - Bienvenida moderna */}
        <div className="w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex flex-col justify-center items-center p-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">¡Bienvenido!</h2>
          <p className="text-blue-100 text-base">
            Accede a tus herramientas y mantente al día con las métricas y documentación. <br />
            ¡Nos alegra tenerte de regreso!
          </p>
        </div>

        {/* Derecha - Formulario oscuro */}
        <div className="w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Nombre de la Empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#334155] border-none rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#334155] border-none rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition duration-150 ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;






