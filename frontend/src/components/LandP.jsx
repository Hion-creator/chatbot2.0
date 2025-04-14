import { useNavigate } from "react-router-dom";

const LandP = () => {
  const navigate = useNavigate();

  // Función para redirigir a la página de login
  const handleLoginClick = () => {
    navigate("/login");
  };

  // Función para redirigir a WhatsApp
  const handleWhatsAppClick = () => {
    const phoneNumber = "573001234567"; // Número de teléfono de WhatsApp
    const message = "Hola, estoy interesado en obtener más información sobre el onboarding."; // Mensaje predefinido
    window.location.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#DEEBFF] via-[#F4F5F7] to-[#FFFFFF] flex items-center justify-center relative overflow-hidden">
      {/* Elementos decorativos sutiles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2684FF] opacity-10 blur-[120px] rounded-full animate-spin-slow"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0052CC] opacity-10 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-[#0052CC]/10 rounded-full animate-ping"></div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-3xl w-full text-center text-[#172B4D] p-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#172B4D] mb-6 tracking-tight leading-tight">
          ¡Bienvenido al Onboarding Empresarial!
        </h1>
        <p className="text-lg md:text-xl mb-8 text-[#42526E]">
          Estamos aquí para brindarte una experiencia de onboarding rápida, intuitiva y completamente adaptada a tu empresa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <div className="bg-white shadow-xl p-6 rounded-2xl hover:scale-105 transition transform duration-300 border border-[#DFE1E6]">
            <h3 className="font-semibold text-lg mb-2 text-[#0052CC]">Simplificación del proceso</h3>
            <p className="text-sm text-[#5E6C84]">Comienza tu experiencia sin barreras ni complicaciones.</p>
          </div>
          <div className="bg-white shadow-xl p-6 rounded-2xl hover:scale-105 transition transform duration-300 border border-[#DFE1E6]">
            <h3 className="font-semibold text-lg mb-2 text-[#0052CC]">Interfaz amigable</h3>
            <p className="text-sm text-[#5E6C84]">Diseñada para brindarte claridad desde el primer clic.</p>
          </div>
          <div className="bg-white shadow-xl p-6 rounded-2xl hover:scale-105 transition transform duration-300 border border-[#DFE1E6]">
            <h3 className="font-semibold text-lg mb-2 text-[#0052CC]">Bienvenida inteligente</h3>
            <p className="text-sm text-[#5E6C84]">Nuestra tecnología guía a tu empresa paso a paso.</p>
          </div>
        </div>

        {/* Sección de acción con un solo botón y enlace */}
        <div className="flex justify-center gap-6 mt-10">
          {/* Botón para Iniciar sesión */}
          <button
            onClick={handleLoginClick}
            className="bg-[#0052CC] text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-[#2684FF] transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#2684FF] focus:ring-opacity-50"
          >
            Ingresar
          </button>
        </div>

        <div className="mt-6 text-sm text-[#5E6C84]">
                   <span>¿Quieres personalizar tu onboarding? </span>
          <span
            onClick={handleWhatsAppClick}
            className="text-[#0052CC] cursor-pointer hover:underline"
          >
            Contáctanos por WhatsApp
          </span>
        </div>
      </div>
    </div>
  );
};

export default LandP;
