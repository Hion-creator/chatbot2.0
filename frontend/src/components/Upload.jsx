import { useState } from "react";

const Upload = ({ token }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Selecciona un archivo PDF");
      return;
    }
    const formData = new FormData();
    // Eliminamos la línea que envía "company_id" ya que el backend lo obtiene del token
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/data/upload_pdf", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // No se debe establecer "Content-Type" para FormData
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Error al subir el archivo PDF");
      }
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert("Error en la subida: " + error.message);
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Subir archivo PDF de Onboarding</h2>
      <form onSubmit={handleUpload} className="flex flex-col space-y-2">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="p-2"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Subir PDF
        </button>
      </form>
    </div>
  );
};

export default Upload;

