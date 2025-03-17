import { useState } from "react";
import Login from "./components/Login";
import Upload from "./components/Upload";
import Chat from "./components/Chat";

function App() {
  const [companyId, setCompanyId] = useState(null);
  const [isLogged, setIsLogged] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-xl p-6">
        {!isLogged ? (
          <Login setCompanyId={setCompanyId} setIsLogged={setIsLogged} />
        ) : (
          <>
            <Upload companyId={companyId} />
            <Chat companyId={companyId} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;

