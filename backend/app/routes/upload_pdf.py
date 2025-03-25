# backend/app/routes/upload_pdf.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.firebase import db
from app.security import verify_token
import PyPDF2
import io
import os
import json
from cryptography.fernet import Fernet
import ollama
from unidecode import unidecode
import re

router = APIRouter()

def normalize_string(s: str) -> str:
    """Normaliza una cadena: quita tildes, espacios extras y la pasa a minúsculas."""
    return unidecode(s.strip().lower())

def get_onboarding_section(full_text: str) -> str:
    marker = "Onboarding de Nuevos Empleados"
    index = full_text.find(marker)
    if index == -1:
        return ""
    return full_text[index:]

def extract_employee_info_with_ai(text: str) -> list:
    prompt = (
        "Extrae la información de cada empleado de la sección 'Onboarding de Nuevos Empleados' "
        "del siguiente texto. Devuelve únicamente un JSON con la siguiente estructura:\n"
        '{"employees": [{"nombre": string, "cargo": string, "correo": string, "tareas": [string], '
        '"fechainicio": string, "fechafin": string, "clave": string}]} \n\n'
        "No incluyas texto adicional, solo el JSON. Texto:\n" + text
    )
    
    response = ollama.chat("gemma3", [{"role": "user", "content": prompt}])
    content = response.get("message", {}).get("content", "").strip()
    print("Respuesta de IA:", content)  # Depuración

    if content.startswith("```"):
        lines = content.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines).strip()
    
    try:
        data = json.loads(content)
        return data.get("employees", [])
    except Exception as e:
        print("Error extrayendo empleados con IA:", e)
        return []

def robust_validate_employees(employees: list) -> list:
    """
    Valida y corrige cada registro de empleado.
    Se esperan los campos: nombre, cargo, correo, tareas, clave.
    Se corrigen errores comunes: renombrar "fecainicio"/"fefchafin" a "fechainicio"/"fechafin"
    y se ignoran estos campos para que se asignen cuando se confirme el onboarding.
    """
    valid_records = []
    required_keys = {"nombre", "cargo", "correo", "tareas", "clave"}
    for emp in employees:
        # Corregir nombres de campos comunes
        if "fecainicio" in emp:
            emp["fechainicio"] = emp.pop("fecainicio")
        if "fefchafin" in emp:
            emp["fechafin"] = emp.pop("fefchafin")
        
        # Limpiar espacios en campos críticos
        for key in ["nombre", "cargo", "correo", "clave"]:
            if key in emp and isinstance(emp[key], str):
                emp[key] = emp[key].strip()
        
        # Validar que todos los campos requeridos estén presentes (excluyendo las fechas)
        if not required_keys.issubset(emp.keys()):
            print(f"Registro descartado, faltan campos en: {emp}")
            continue
        
        # Si "tareas" no es lista, convertirla
        if not isinstance(emp["tareas"], list):
            if isinstance(emp["tareas"], str):
                emp["tareas"] = [t.strip() for t in emp["tareas"].split("|") if t.strip()]
            else:
                emp["tareas"] = []
        
        valid_records.append(emp)
    return valid_records

def process_tasks(tasks_raw):
    """
    Convierte la lista de tareas (lista de strings) en una lista de objetos:
    { "descripcion": <tarea>, "estado": "pendiente" }
    """
    tasks = []
    for t in tasks_raw:
        t = t.strip()
        if t:
            tasks.append({"descripcion": t, "estado": "pendiente"})
    return tasks

@router.post("/upload_pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    token_company_id: str = Depends(verify_token)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")
    
    # Extraer el texto completo del PDF
    contents = await file.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
    extracted_text = ""
    for page in pdf_reader.pages:
        page_text = page.extract_text()
        if page_text:
            extracted_text += page_text

    # Encriptar el contenido completo del PDF
    key = os.environ.get("FERNET_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Clave de encriptación no configurada")
    fernet = Fernet(key.encode())
    encrypted_text = fernet.encrypt(extracted_text.encode()).decode()

    # Extraer la sección de Onboarding de Nuevos Empleados
    onboarding_section = get_onboarding_section(extracted_text)
    if not onboarding_section:
        print("No se encontró la sección 'Onboarding de Nuevos Empleados'")
    
    # Usar la IA para extraer la información de empleados
    employees_info = extract_employee_info_with_ai(onboarding_section)
    employees_info = robust_validate_employees(employees_info)
    
    # Post-procesar la clave para eliminar espacios alrededor del guion
    for emp in employees_info:
        if "clave" in emp and emp["clave"]:
            emp["clave"] = re.sub(r"\s*-\s*", "-", emp["clave"])
    
    # No se almacenan las fechas extraídas; se asignarán en el momento de confirmar el onboarding.
    for emp in employees_info:
        emp["fechainicio"] = ""
        emp["fechafin"] = ""
    
    # Actualizar el documento de la empresa con el PDF encriptado
    company_ref = db.collection("companies").document(token_company_id)
    company_ref.update({"onboarding_data": encrypted_text})

    # Crear la subcolección "onboardings" y agregar cada registro
    onboardings_ref = company_ref.collection("onboardings")
    for emp in employees_info:
        # Procesar tareas: convertir cada tarea en objeto con "descripcion" y "estado"
        tareas_obj = process_tasks(emp.get("tareas", []))
        data_doc = {
            "nombre": emp.get("nombre", ""),
            "cargo": emp.get("cargo", ""),
            "correo": emp.get("correo", ""),
            "clave": emp.get("clave", ""),
            "tareas": tareas_obj,
            "fechainicio": "",  # Se asignará cuando se confirme el onboarding
            "fechafin": "",     # Se asignará cuando se confirme el onboarding
            "estado": "pendiente"
        }
        onboardings_ref.add(data_doc)
    
    return {
        "message": "Archivo PDF procesado y datos actualizados exitosamente",
        "empleados_registrados": len(employees_info)
    }






