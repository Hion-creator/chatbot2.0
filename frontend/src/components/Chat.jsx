import React, { useState } from "react";

const Chat = ({ companyId }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async (e) => {
    e.preventDefault();
    // Agregar mensaje del usuario a la conversación
    const userMsg = { role: "Usuario", content: input };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/ai/chatbot?company_id=${companyId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );
      if (!response.ok) {
        throw new Error("Error en el chat");
      }
      const data = await response.json();
      // Extraer solo el contenido del mensaje de la respuesta
      const aiContent = data.response.message.content;
      const aiMsg = { role: "IA", content: aiContent };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error en el chat: ", error);
    }
    setInput("");
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Chatbot</h1>
      <div className="border border-gray-300 p-4 h-64 overflow-y-auto bg-gray-50 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${
              msg.role === "Usuario" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"
            }`}
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

