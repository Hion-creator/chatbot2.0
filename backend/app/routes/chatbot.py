from fastapi import APIRouter, HTTPException
import ollama
from app.services.firebase import db

router = APIRouter()

@router.post("/chatbot")
def chatbot_interaction(user_input: dict, company_id: str):
    # Obtener datos de onboarding de la empresa
    company_ref = db.collection("companies").document(company_id)
    company_snapshot = company_ref.get()
    if not company_snapshot.exists:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    
    company_data = company_snapshot.to_dict()
    onboarding_data = company_data.get("onboarding_data", "")
    
    # Validar que se reciba un mensaje en el body
    message = user_input.get("message")
    if not message:
        raise HTTPException(status_code=400, detail="No se proporcionó mensaje en el body")
    
    # Construir los mensajes en el formato adecuado:
    messages = [
         {"role": "system", "content": f"Información de la empresa: {onboarding_data}"},
         {"role": "user", "content": message}
    ]
    
    try:
         response = ollama.chat("gemma2", messages)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error al comunicarse con el modelo de IA: {e}")
    
    return {"response": response}
