# backend/app/routes/onboarding.py

from fastapi import APIRouter, HTTPException, Depends
from app.services.firebase import db
from app.security import verify_token
from datetime import datetime, timedelta, timezone
import os, json, re, smtplib, ollama
from email.mime.text import MIMEText
from unidecode import unidecode
from cryptography.fernet import Fernet

router = APIRouter()

def normalize_string(s: str) -> str:
    """Quita tildes, espacios y pasa a minúsculas."""
    return unidecode(s or "").strip().lower()

def send_onboarding_email(email: str, name: str, clave: str):
    """Envía por SMTP la clave de verificación al empleado."""
    server, port = "smtp.gmail.com", 587
    sender = os.getenv("GMAIL_USER")
    pwd    = os.getenv("GMAIL_PASS")
    if not sender or not pwd:
        print("⚠️ SMTP no configurado")
        return

    subject = "Código de verificación para tu Onboarding"
    body = f"Hola {name},\n\nTu código para iniciar el Onboarding es:\n\n{clave}\n\n¡Bienvenido!"
    msg = MIMEText(body)
    msg["Subject"], msg["From"], msg["To"] = subject, sender, email

    try:
        with smtplib.SMTP(server, port) as smtp:
            smtp.starttls()
            smtp.login(sender, pwd)
            smtp.send_message(msg)
    except Exception as e:
        print("❌ Error SMTP:", e)

@router.post("/chatbot")
def onboarding_chatbot(payload: dict, company_id: str = Depends(verify_token)):
    """
    Flujo de onboarding conversacional único:
     - 'iniciar <nombre>' envía la clave por correo.
     - 'iniciar <nombre> <clave>' confirma y asigna fechas.
     - 'tarea' devuelve la descripción de la tarea en curso.
     - 'examen' genera examen para la tarea actual.
     - Cualquier otro texto → respuesta general usando el PDF.
    """
    msg = (payload.get("message") or "").strip()
    if not msg:
        raise HTTPException(400, "El campo 'message' es requerido.")

    # 1) Obtener documento de empresa
    comp_ref = db.collection("companies").document(company_id)
    comp_snap = comp_ref.get()
    if not comp_snap.exists:
        raise HTTPException(404, "Empresa no encontrada.")
    comp_data = comp_snap.to_dict()

    # 2) Desencriptar onboarding_data si existe
    onboarding_text = ""
    enc = comp_data.get("onboarding_data")
    if enc:
        key = os.getenv("FERNET_KEY")
        if not key:
            raise HTTPException(500, "Clave de encriptación no configurada.")
        try:
            f = Fernet(key.encode())
            onboarding_text = f.decrypt(enc.encode()).decode()
        except Exception as e:
            raise HTTPException(500, f"Error descifrando datos: {e}")

    # 3) Buscar empleado cuyo nombre esté contenido en el mensaje
    emp_ref = comp_ref.collection("onboardings")
    matched = None
    for doc in emp_ref.stream():
        rec = doc.to_dict()
        if normalize_string(rec.get("nombre")) in normalize_string(msg):
            matched = (doc.id, rec)
            break

    # 4) Si hay match, entramos al flujo de onboarding
    if matched:
        doc_id, emp = matched
        estado = emp.get("estado", "pendiente")
        nombre = emp["nombre"]
        correo = emp["correo"]
        clave  = emp["clave"]

        # 4.1 Enviar clave: mensaje 'iniciar <nombre>' sin clave
        if estado == "pendiente" and msg.lower().startswith("iniciar"):
            # Si incluye clave ya, dejar paso siguiente
            tokens = msg.split()
            if len(tokens) == 2:
                send_onboarding_email(correo, nombre, clave)
                return {"response": f"Clave enviada a {correo}. Responde 'iniciar {nombre} <clave>'."}

        # 4.2 Confirmar onboarding con clave
        if estado == "pendiente" and clave and clave in msg:
            # Asignar fechas
            ahora = datetime.now(timezone.utc)
            fin   = ahora + timedelta(days=30)
            emp_ref.document(doc_id).update({
                "estado": "iniciado",
                "fecha_inicio": ahora.isoformat(),
                "fecha_fin": fin.isoformat()
            })
            return {
                "response": f"Onboarding de {nombre} iniciado. Tienes {len(emp['tareas'])} tareas. Escribe 'tarea' o 'examen'."
            }

        # 4.3 Estado 'iniciado'
        if estado == "iniciado":
            # 4.3.1 Describir tarea en curso
            if msg.lower() == "tarea":
                idx = next((i for i,t in enumerate(emp["tareas"]) if t["estado"] != "terminada"), 0)
                desc = emp["tareas"][idx]["descripcion"]
                return {"response": f"Tarea actual: {desc}"}

            # 4.3.2 Generar examen
            if msg.lower() == "examen":
                idx = next((i for i,t in enumerate(emp["tareas"]) if t["estado"] != "terminada"), None)
                if idx is None:
                    return {"response": "¡Has completado todas las tareas!"}
                desc = emp["tareas"][idx]["descripcion"]
                prompt = (
                    f"Genera un examen de 5 preguntas de selección múltiple basadas en: {desc}. "
                    "Devuélvelo SOLO como JSON con claves 'preguntas' y 'comentarios'."
                )
                try:
                    ai_resp = ollama.chat("gemma3", [{"role":"user","content":prompt}])
                    content = re.sub(r"```", "", ai_resp["message"]["content"]).strip()
                    examen = json.loads(content)
                except Exception as e:
                    raise HTTPException(500, f"Error IA examen: {e}")

                # Guardar examen
                exams = emp.get("examenes", [])
                while len(exams) <= idx:
                    exams.append({})
                examen["fecha"] = datetime.now(timezone.utc).isoformat()
                exams[idx] = examen
                emp_ref.document(doc_id).update({"examenes": exams})

                return {"response": "Examen generado.", "examen": examen}

    # 5) Si no pertenece a onboarding o tras flujo, tratamos como pregunta general
    prompt = (
        f"Contexto de onboarding (PDF):\n{onboarding_text}\n\n"
        f"Usuario pregunta: {msg}"
    )
    try:
        ai_resp = ollama.chat("gemma2", [{"role":"user","content":prompt}])
        ans = ai_resp["message"]["content"]
        return {"response": ans}
    except Exception as e:
        raise HTTPException(500, f"Error IA general: {e}")



