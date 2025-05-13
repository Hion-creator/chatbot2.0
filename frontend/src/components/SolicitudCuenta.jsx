import React, { useState } from 'react'

function SolicitudCuenta() {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    nombre_contacto: '',
    email: '',
    telefono: '',
    mensaje: ''
  })

  const [mensaje, setMensaje] = useState('')
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Aquí podrías enviar la info a un backend real
      console.log('Solicitud enviada:', formData)
      setEnviado(true)
      setMensaje('Tu solicitud ha sido enviada. Un asesor se comunicará contigo pronto.')
    } catch (err) {
      setMensaje('Hubo un error al enviar la solicitud. Intenta nuevamente.',err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="bg-[#1e293b] p-8 rounded-xl w-full max-w-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Solicitud de Cuenta</h2>
        {mensaje && <p className={`text-center mb-4 ${enviado ? 'text-green-400' : 'text-red-400'}`}>{mensaje}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nombre_empresa"
            placeholder="Nombre de la Empresa"
            value={formData.nombre_empresa}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#334155] text-white rounded focus:outline-none"
          />
          <input
            type="text"
            name="nombre_contacto"
            placeholder="Nombre del Contacto"
            value={formData.nombre_contacto}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#334155] text-white rounded focus:outline-none"
          />
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#334155] text-white rounded focus:outline-none"
          />
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-[#334155] text-white rounded focus:outline-none"
          />
          <textarea
            name="mensaje"
            placeholder="Mensaje adicional (opcional)"
            value={formData.mensaje}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#334155] text-white rounded focus:outline-none resize-none"
            rows={4}
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded transition">
            Enviar Solicitud
          </button>
        </form>
      </div>
    </div>
  )
}

export default SolicitudCuenta
