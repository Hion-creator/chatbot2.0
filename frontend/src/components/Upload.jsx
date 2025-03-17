import { useState } from "react";

const Upload = ({ companyId }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Selecciona un archivo PDF");
      return;
    }
    const formData = new FormData();
    formData.append("company_id", companyId);
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/data/upload_pdf", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Error al subir el archivo PDF");
      const data = await res.json();
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
