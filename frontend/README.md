# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

frontend/
├── src/
│   ├── App.jsx                // Configuración de rutas principales
│   ├── components/
│   │   ├── Login.jsx          // Formulario de login
│   │   ├── Dashboard.jsx      // Dashboard principal (opciones: subir PDF, métricas, iniciar bot)
│   │   ├── UploadPDF.jsx      // Vista para subir PDF y ver mensaje de verificación de empleados
│   │   ├── Metrics.jsx        // Dashboard de métricas y progreso de onboarding
│   │   ├── OnboardingBot.jsx  // Interfaz del bot de onboarding: selección de empleado y chat
│   │   └── ExamForm.jsx       // Formulario para responder el examen de una tarea
│   ├── services/
│   │   └── api.js             // Funciones para llamar a los endpoints del backend
│   └── index.css              // Estilos (por ejemplo, usando Tailwind CSS)
└── package.json