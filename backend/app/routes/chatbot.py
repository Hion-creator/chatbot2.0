from fastapi import APIRouter, HTTPException, Depends
import ollama
from app.services.firebase import db
from app.security import verify_token
import os
from cryptography.fernet import Fernet

router = APIRouter()

@router.post("/chatbot")
def chatbot_interaction(user_input: dict, company_id: str = Depends(verify_token)):
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

    message = user_input.get("message", "")
    if not message:
        raise HTTPException(status_code=400, detail="No se proporcionó mensaje en el body")
    
    # 🔍 Intentamos detectar si se menciona a un empleado
    nombre_empleado = user_input.get("employee_name", "").strip().lower()
    if nombre_empleado:
        onboardings_ref = company_ref.collection("onboardings")
        empleado = None
        for doc in onboardings_ref.stream():
            data = doc.to_dict()
            if data.get("nombre", "").strip().lower() == nombre_empleado:
                empleado = data
                break
        
        if empleado:
            estado = empleado.get("estado", "pendiente")
            tareas = empleado.get("tareas", [])
            task_index = next((i for i, t in enumerate(tareas) if t.get("estado") != "terminada"), 0)

            if "iniciar" in message.lower():
                return {
                    "response": f"Hola {empleado['nombre']}, para iniciar tu onboarding por favor ingresa tu código enviado al correo {empleado['correo']}."
                }
            elif "listo para examen" in message.lower():
                return {
                    "response": f"Perfecto. Puedes iniciar tu evaluación de la tarea: {tareas[task_index]['descripcion']}.",
                    "exam_ready": True,
                    "task_index": task_index
                }
            elif "tarea" in message.lower():
                descripcion = tareas[task_index].get("descripcion", "")
                return {
                    "response": f"Tu tarea actual es: {descripcion}. Puedes preguntarme sobre ella si lo deseas.",
                    "task_index": task_index
                }
    
    # 🤖 Pregunta general sobre la empresa
    prompt = (
        f"Usa la siguiente información de la empresa:\n{onboarding_data}\n\n"
        f"Responde la siguiente pregunta de manera concisa: {message}"
    )

    try:
        response = ollama.chat("gemma3", [{"role": "user", "content": prompt}])
        content = response.get("message", {}).get("content", "").strip()
        return {"response": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interactuando con el bot: {e}")


