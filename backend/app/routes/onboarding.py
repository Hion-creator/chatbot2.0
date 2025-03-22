# backend/app/routes/onboarding.py
from fastapi import APIRouter, HTTPException, Depends
from app.services.firebase import db
from app.security import verify_token
from datetime import datetime, timedelta
import os
import smtplib
import ollama
from email.mime.text import MIMEText
from unidecode import unidecode
import json

router = APIRouter()

def normalize_string(s: str) -> str:
    return unidecode(s.strip().lower())

def send_onboarding_email(email: str, employee_name: str, clave: str):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = os.environ.get("GMAIL_USER")
    sender_password = os.environ.get("GMAIL_PASS")
    
    subject = "Código de verificación para iniciar tu Onboarding"
    body = f"""Hola {employee_name},

Se ha solicitado iniciar tu proceso de onboarding.

Tu clave para iniciar es:
{clave}

Saludos,
El equipo de Onboarding
"""
    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = email
    
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, [email], message.as_string())
        server.quit()
    except Exception as e:
        print("Error al enviar el correo:", e)


@router.get("/employees")
def list_employees(company_id: str = Depends(verify_token)):
    """
    Lista los empleados de la subcolección 'onboardings', mostrando doc_id, nombre_original, cargo, correo y estado.
    """
    employees_ref = db.collection("companies").document(company_id).collection("onboardings")
    docs = employees_ref.stream()
    employees_list = []
    for doc in docs:
        data = doc.to_dict()
        employees_list.append({
            "doc_id": doc.id,
            "nombre": data.get("nombre", ""),
            "cargo": data.get("cargo", ""),
            "correo": data.get("correo", ""),
            "estado": data.get("estado", "pendiente")
        })
    return {"employees": employees_list}


@router.post("/request")
def request_onboarding(data: dict, company_id: str = Depends(verify_token)):
    raw_name = data.get("employee_name", "")
    if not raw_name:
        raise HTTPException(status_code=400, detail="Falta employee_name")

    # Normalizar el nombre que llega
    employee_name_norm = normalize_string(raw_name)

    employees_ref = db.collection("companies").document(company_id).collection("onboardings")
    all_docs = employees_ref.stream()
    matched_doc = None

    for doc in all_docs:
        d = doc.to_dict()
        # También normalizamos lo que está guardado en Firebase
        nombre_db_norm = normalize_string(d.get("nombre", ""))
        if nombre_db_norm == employee_name_norm:
            matched_doc = (doc.id, d)
            break

    if not matched_doc:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    doc_id, employee_data = matched_doc
    clave = employee_data.get("clave")
    correo = employee_data.get("correo")
    nombre = employee_data.get("nombre", raw_name)

    if not clave or not correo:
        raise HTTPException(status_code=400, detail="El empleado no tiene clave o correo en el registro")

    # Enviar la clave al correo
    send_onboarding_email(correo, nombre, clave)

    return {
        "message": f"Clave de verificación enviada al correo de {nombre}.",
        "doc_id": doc_id,
        "correo_enviado": True
    }


@router.post("/confirm")
def confirm_onboarding(data: dict, company_id: str = Depends(verify_token)):
    raw_name = data.get("employee_name", "")
    clave_ingresada = data.get("clave", "")
    if not raw_name or not clave_ingresada:
        raise HTTPException(status_code=400, detail="Falta employee_name o clave")

    # Mismo procedimiento de normalización
    employee_name_norm = normalize_string(raw_name)

    employees_ref = db.collection("companies").document(company_id).collection("onboardings")
    all_docs = employees_ref.stream()
    matched_doc = None

    for doc in all_docs:
        d = doc.to_dict()
        nombre_db_norm = normalize_string(d.get("nombre", ""))
        if nombre_db_norm == employee_name_norm:
            matched_doc = (doc.id, d)
            break

    if not matched_doc:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    doc_id, employee_data = matched_doc
    clave_almacenada = employee_data.get("clave")
    if clave_almacenada != clave_ingresada:
        raise HTTPException(status_code=401, detail="Clave incorrecta")

    fecha_inicio = datetime.utcnow()
    fecha_fin = fecha_inicio + timedelta(days=30)

    employees_ref.document(doc_id).update({
        "fecha_inicio": fecha_inicio.isoformat(),
        "fecha_fin": fecha_fin.isoformat(),
        "estado": "iniciado"
    })

    return {
        "message": "Onboarding confirmado y activado.",
        "estado": "iniciado",
        "tareas": employee_data.get("tareas", []),
        "fecha_inicio": fecha_inicio.isoformat(),
        "fecha_fin": fecha_fin.isoformat()
    }

@router.post("/evaluate")
def evaluate_onboarding(data: dict, company_id: str = Depends(verify_token)):
    """
    Genera una evaluación para la tarea actual del empleado.
    
    Se espera que 'data' incluya:
      - employee_name: Nombre del empleado.
      - task_index: Índice (0-indexed) de la tarea a evaluar.
    
    La IA debe generar una evaluación que conste de 5 preguntas de selección múltiple
    (con única respuesta correcta) y un campo 'comentarios' para comentarios generales.
    
    La evaluación tendrá la siguiente estructura JSON:
    {
      "preguntas": [
         {
           "pregunta": "Pregunta 1",
           "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
           "respuesta_correcta": "Opción B"
         },
         ... 5 preguntas ...
      ],
      "comentarios": "Comentarios generales sobre la tarea."
    }
    
    La evaluación se registra en el campo "evaluaciones" en la posición task_index.
    """
    raw_name = data.get("employee_name", "")
    task_index = data.get("task_index")
    if not raw_name or task_index is None:
        raise HTTPException(status_code=400, detail="Falta employee_name o task_index")
    
    # Normalizamos el nombre
    employee_name_norm = normalize_string(raw_name)
    
    # Buscar al empleado en la subcolección "onboardings" comparando el nombre normalizado
    employees_ref = db.collection("companies").document(company_id).collection("onboardings")
    matched_doc = None
    for doc in employees_ref.stream():
        d = doc.to_dict()
        if normalize_string(d.get("nombre", "")) == employee_name_norm:
            matched_doc = (doc.id, d)
            break
    if not matched_doc:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    doc_id, employee_data = matched_doc
    tareas = employee_data.get("tareas", [])
    if task_index >= len(tareas):
        raise HTTPException(status_code=400, detail="Índice de tarea fuera de rango")
    
    task_description = tareas[task_index]
    
    # Construir el prompt para la IA
    evaluation_prompt = (
        f"Genera una evaluación para la siguiente tarea: '{task_description}'. "
        "La evaluación debe constar de 5 preguntas de selección múltiple (con única respuesta correcta) y al final "
        "un campo 'comentarios' para que el empleado escriba sus comentarios generales sobre la tarea. "
        "Devuelve únicamente un JSON con la siguiente estructura:\n"
        '{"preguntas": [ {"pregunta": string, "opciones": [string, string, string, string], "respuesta_correcta": string } ], "comentarios": string }'
    )
    
    try:
        response = ollama.chat("gemma3", [{"role": "user", "content": evaluation_prompt}])
        content = response.get("message", {}).get("content", "").strip()
        print("Respuesta de evaluación de IA:", content)  # Depuración
        # Limpieza de posibles delimitadores markdown
        import re
        content = re.sub(r"^```(json)?", "", content, flags=re.IGNORECASE)
        content = re.sub(r"```$", "", content)
        content = content.strip()
        
        evaluation_result = json.loads(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando evaluación: {e}")
    
    # Obtener la lista actual de evaluaciones y actualizar la evaluación de la tarea en el índice task_index
    evaluaciones = employee_data.get("evaluaciones", [])
    if not isinstance(evaluaciones, list):
        evaluaciones = []
    if task_index < len(evaluaciones):
        evaluaciones[task_index] = evaluation_result
    else:
        # Rellenar con objetos vacíos si es necesario
        while len(evaluaciones) < task_index:
            evaluaciones.append({})
        evaluaciones.append(evaluation_result)
    
    employees_ref.document(doc_id).update({
        "evaluaciones": evaluaciones
    })
    
    return {
        "message": "Evaluación generada y registrada exitosamente",
        "evaluacion": evaluation_result
    }

@router.get("/onboarding/metrics")
def get_onboarding_metrics(company_id: str = Depends(verify_token)):
    """
    Devuelve un resumen de las métricas de onboarding.
    """
    employees_ref = db.collection("companies").document(company_id).collection("onboardings")
    docs = employees_ref.stream()
    metrics = []
    for doc in docs:
        data = doc.to_dict()
        metrics.append({
            "doc_id": doc.id,
            "nombre": data.get("nombre", ""),
            "estado": data.get("estado", "pendiente"),
            "fecha_inicio": data.get("fecha_inicio"),
            "fecha_fin": data.get("fecha_fin"),
            "evaluacion": data.get("evaluacion")
        })
    return {"metrics": metrics}
