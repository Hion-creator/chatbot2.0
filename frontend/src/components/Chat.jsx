import { useState } from "react";

const Chat = ({ companyId, token }) => {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleSend = async (e) => {
    e.preventDefault();
    const userMsg = { role: "Usuario", content: input };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(`http://127.0.0.1:8000/ai/chatbot?company_id=${companyId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });
      if (!response.ok) throw new Error("Error en el chat");
      const data = await response.json();
      const aiMsg = { role: "IA", content: data.response.message.content };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (error) {
      alert("Error en el chat: " + error.message);
    }
    setInput("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Chatbot</h2>
      <div className="border border-gray-300 p-4 h-64 overflow-y-auto bg-gray-50 mb-4">
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${msg.role === "Usuario" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"}`}
          >
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex space-x-2">
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          className="flex-grow p-2 border border-gray-300 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Enviar
        </button>
      </form>
    </div>
  );
};

export default Chat;

