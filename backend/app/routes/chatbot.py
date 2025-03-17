from fastapi import APIRouter, HTTPException, Depends
import ollama
from app.services.firebase import db
from app.security import verify_token
import os
from cryptography.fernet import Fernet

router = APIRouter()

@router.post("/chatbot")
def chatbot_interaction(user_input: dict, company_id: str = Depends(verify_token)):
    # Obtener datos de onboarding de la empresa desde Firebase
    company_ref = db.collection("companies").document(company_id)
    company_snapshot = company_ref.get()
    if not company_snapshot.exists:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    company_data = company_snapshot.to_dict()
    encrypted_text = company_data.get("onboarding_data", "")
    onboarding_data = ""
    if encrypted_text:
        key = os.environ.get("FERNET_KEY")
        if not key:
            raise HTTPException(status_code=500, detail="Clave de encriptación no configurada")
        try:
            fernet = Fernet(key.encode())
            onboarding_data = fernet.decrypt(encrypted_text.encode()).decode()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error al descifrar datos: {e}")

    # Si la información es muy extensa, la truncamos o resumimos (aquí limitamos a 500 caracteres)
    max_length = 500
    if len(onboarding_data) > max_length:
        onboarding_data = onboarding_data[:max_length] + "..."

    # Validar que se reciba un mensaje en el body
    message = user_input.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="No se proporcionó mensaje en el body")
    
    # Construir el prompt incluyendo el contexto del PDF
    messages = [
        {"role": "system", "content": f"Utiliza la siguiente información de la empresa para responder: {onboarding_data}"},
        {"role": "user", "content": message}
    ]
    
    try:
        response = ollama.chat("gemma2", messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al comunicarse con el modelo de IA: {e}")
    
    return {"response": response}

