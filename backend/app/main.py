from fastapi import FastAPI
from app.routes import auth, data, upload_pdf, chatbot

app = FastAPI()

app.include_router(auth.router, prefix="/auth")
app.include_router(data.router, prefix="/data")
app.include_router(upload_pdf.router, prefix="/data")
app.include_router(chatbot.router, prefix="/ai")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
