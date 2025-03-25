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
from fastapi import Query

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
    Genera un examen (5 preguntas + comentarios) para la tarea actual del empleado.
    No corrige nada aún; solo crea y guarda el examen en 'examenes[task_index]'.
    """
    raw_name = data.get("employee_name", "")
    task_index = data.get("task_index")
    if not raw_name or task_index is None:
        raise HTTPException(status_code=400, detail="Falta employee_name o task_index")

    # Buscar al empleado y a la tarea
    employee_name_norm = normalize_string(raw_name)
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

    # Prompt a la IA para generar el examen
    evaluation_prompt = (
    f"Genera un examen basado en la siguiente tarea: '{task_description}'. "
    "El examen debe constar de 5 preguntas de selección múltiple. Cada pregunta debe tener 4 opciones: 'A','B','C','D'. "
    "La clave 'respuesta_correcta' debe ser solo una letra: 'A','B','C' o 'D'. "
    "Devuelve únicamente un JSON con la siguiente estructura:\n"
    '{"preguntas": [ '
    '{ "pregunta": string, '
    '"opciones": { "A": string, "B": string, "C": string, "D": string }, '
    '"respuesta_correcta": "A" }, ... ], '
    '"comentarios": string }'
)
    # Llamada a la IA
    try:
        response = ollama.chat("gemma3", [{"role": "user", "content": evaluation_prompt}])
        content = response.get("message", {}).get("content", "").strip()
        # Limpieza
        import re
        content = re.sub(r"^```(json)?", "", content, flags=re.IGNORECASE)
        content = re.sub(r"```$", "", content).strip()
        if not content:
            raise Exception("Respuesta vacía de la IA")

        exam = json.loads(content)  # {"preguntas": [...], "comentarios": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando evaluación: {e}")

    # Guardar el examen en "examenes"
    examenes = employee_data.get("examenes", [])
    if not isinstance(examenes, list):
        examenes = []
    while len(examenes) <= task_index:
        examenes.append({})
    # Asignamos la fecha de creación del examen
    exam["fecha_examen"] = datetime.utcnow().isoformat()
    examenes[task_index] = exam

    employees_ref.document(doc_id).update({"examenes": examenes})

    return {
        "message": "Examen generado exitosamente",
        "examen": exam
    }
    
@router.post("/submitAnswers")
def submit_answers(data: dict, company_id: str = Depends(verify_token)):
    raw_name = data.get("employee_name", "")
    task_index = data.get("task_index")
    respuestas_empleado = data.get("respuestas", [])
    if not raw_name or task_index is None or not isinstance(respuestas_empleado, list):
        raise HTTPException(status_code=400, detail="Faltan datos o el formato de respuestas es inválido")

    # Buscar al empleado
    employee_name_norm = normalize_string(raw_name)
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

    # Obtener el examen correspondiente
    examenes = employee_data.get("examenes", [])
    if task_index >= len(examenes):
        raise HTTPException(status_code=400, detail="No existe un examen para esa tarea")
    examen = examenes[task_index]
    preguntas = examen.get("preguntas", [])

    # Validar que el número de preguntas coincida con las respuestas
    if len(preguntas) != len(respuestas_empleado):
        raise HTTPException(status_code=400, detail="La cantidad de respuestas no coincide con las preguntas")

    # Calcular puntaje
    correctas = 0
    for i, pregunta in enumerate(preguntas):
        respuesta_correcta = pregunta.get("respuesta_correcta", "")
        if i < len(respuestas_empleado) and respuestas_empleado[i] == respuesta_correcta:
            correctas += 1
    puntaje = (correctas / len(preguntas)) * 100

    # Guardar resultado en "evaluaciones"
    evaluaciones = employee_data.get("evaluaciones", [])
    if not isinstance(evaluaciones, list):
        evaluaciones = []
    while len(evaluaciones) <= task_index:
        evaluaciones.append({})
    resultado_evaluacion = {
        "fecha_eval": datetime.utcnow().isoformat(),
        "puntaje": puntaje,
        "total_preguntas": len(preguntas),
        "correctas": correctas,
        "respuestas_empleado": respuestas_empleado
    }
    evaluaciones[task_index] = resultado_evaluacion

    # Actualizar el estado de la tarea si el puntaje ≥ 70
    tareas = employee_data.get("tareas", [])
    if task_index < len(tareas):
        # Suponiendo que cada tarea es un objeto { "descripcion": "", "estado": "" }
        if puntaje >= 70:
            tareas[task_index]["estado"] = "terminada"
        else:
            # Si deseas que quede "en proceso" o "por hacer"
            tareas[task_index]["estado"] = "en proceso"
    else:
        # El índice de tarea está fuera de rango; no hacemos nada
        pass

    # Guardar cambios en Firebase
    employees_ref.document(doc_id).update({
        "evaluaciones": evaluaciones,
        "tareas": tareas
    })

    return {
        "message": "Respuestas registradas exitosamente",
        "puntaje": puntaje,
        "correctas": correctas,
        "total_preguntas": len(preguntas),
        "estado_tarea": tareas[task_index]["estado"] if task_index < len(tareas) else None
    }

@router.get("/metrics")
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

@router.get("/general-query")
def general_query(query: str = Query(..., description="La pregunta sobre la empresa"),
                  token_company_id: str = Depends(verify_token)):
    """
    Permite preguntar sobre la empresa utilizando el contenido del PDF (onboarding_data).
    La IA responderá basándose en la información del PDF.
    """
    # Obtener el documento de la empresa
    company_ref = db.collection("companies").document(token_company_id)
    company_snapshot = company_ref.get()
    if not company_snapshot.exists:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    company_data = company_snapshot.to_dict()
    onboarding_data = company_data.get("onboarding_data", "")
    
    if not onboarding_data:
        raise HTTPException(status_code=400, detail="No hay información de onboarding disponible")
    
    prompt = (
        f"Usa la siguiente información de la empresa:\n{onboarding_data}\n\n"
        f"Responde la siguiente pregunta de manera concisa: {query}"
    )
    
    try:
        response = ollama.chat("gemma3", [{"role": "user", "content": prompt}])
        content = response.get("message", {}).get("content", "").strip()
        # Limpieza de delimitadores markdown
        import re
        content = re.sub(r"^```(json)?", "", content, flags=re.IGNORECASE)
        content = re.sub(r"```$", "", content).strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando respuesta: {e}")
    
    return {"response": content}

@router.get("/task-query")
def task_query(employee_name: str = Query(..., description="Nombre del empleado"),
               task_index: int = Query(..., description="Índice de la tarea"),
               query: str = Query(..., description="La pregunta sobre la tarea"),
               token_company_id: str = Depends(verify_token)):
    """
    Permite preguntar sobre una tarea específica del empleado.
    Se busca al empleado usando el nombre normalizado, se obtiene la descripción de la tarea y
    la IA responde la pregunta basándose en esa descripción.
    """
    # Buscar al empleado en la subcolección "onboardings"
    employees_ref = db.collection("companies").document(token_company_id).collection("onboardings")
    matched_doc = None
    for doc in employees_ref.stream():
        d = doc.to_dict()
        if normalize_string(d.get("nombre", "")) == normalize_string(employee_name):
            matched_doc = (doc.id, d)
            break
    if not matched_doc:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    doc_id, employee_data = matched_doc
    tareas = employee_data.get("tareas", [])
    if task_index >= len(tareas):
        raise HTTPException(status_code=400, detail="Índice de tarea fuera de rango")
    
    # Asumimos que cada tarea es un objeto { "descripcion": "..." }
    task_description = tareas[task_index].get("descripcion", "")
    if not task_description:
        raise HTTPException(status_code=400, detail="No se encontró la descripción de la tarea")
    
    prompt = (
        f"Basado en la siguiente tarea: '{task_description}', responde la siguiente pregunta de manera concisa:\n{query}"
    )
    
    try:
        response = ollama.chat("gemma3", [{"role": "user", "content": prompt}])
        content = response.get("message", {}).get("content", "").strip()
        import re
        content = re.sub(r"^```(json)?", "", content, flags=re.IGNORECASE)
        content = re.sub(r"```$", "", content).strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando respuesta: {e}")
    
    return {"response": content}
