from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from app.routes import auth, upload_pdf, chatbot
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Configurar CORS (ajusta los orígenes permitidos según tu entorno)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar rate limiting con slowapi
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter  # Asignamos el objeto Limiter al estado de la app
app.add_middleware(SlowAPIMiddleware)  # Agregamos el middleware sin pasar 'limiter'

# Middleware para cabeceras de seguridad
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Content-Security-Policy"] = "default-src 'self';"
    return response

#solo 1 vez
# from cryptography.fernet import Fernet
# key = Fernet.generate_key()
# print(key.decode())  # Guarda este valor de forma segura.


# Incluir routers
app.include_router(auth.router, prefix="/auth")
app.include_router(upload_pdf.router, prefix="/data")
app.include_router(chatbot.router, prefix="/ai")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


