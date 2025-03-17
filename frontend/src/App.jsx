import { useState } from "react";
import Login from "./components/Login";
import Upload from "./components/Upload";
import Chat from "./components/Chat";

function App() {
  const [companyId, setCompanyId] = useState(null);
  const [token, setToken] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-xl p-6">
        {!isLogged ? (
          <Login setCompanyId={setCompanyId} setToken={setToken} setIsLogged={setIsLogged} />
        ) : (
          <>
            <Upload companyId={companyId} token={token} />
            <Chat companyId={companyId} token={token} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;


