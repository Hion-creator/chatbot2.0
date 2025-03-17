import { useState } from "react";

const Login = ({ setCompanyId, setToken, setIsLogged }) => {
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName, password }),
      });
      if (!res.ok) throw new Error("Credenciales incorrectas");
      const data = await res.json();
      // Se asume que la respuesta incluye "access_token" y "id"
      setCompanyId(data.id);
      setToken(data.access_token);
      setIsLogged(true);
    } catch (error) {
      alert("Error en el login: " + error.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-4">Login Empresa</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre de la empresa"
          className="w-full p-3 border border-gray-300 rounded"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
};

export default Login;
