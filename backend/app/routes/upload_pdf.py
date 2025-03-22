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
    """
    Extrae la sección 'Onboarding de Nuevos Empleados' del texto completo.
    Si no se encuentra la sección, retorna cadena vacía.
    """
    marker = "Onboarding de Nuevos Empleados"
    index = full_text.find(marker)
    if index == -1:
        return ""
    return full_text[index:]  # Tomar desde el marcador hasta el final

def extract_employee_info_with_ai(text: str) -> list:
    """
    Usa la IA para extraer la información de cada empleado de la sección 'Onboarding de Nuevos Empleados'.
    Se espera que la IA devuelva un JSON con la siguiente estructura:
    {
       "employees": [
           {
              "nombre": "Sofía Ramírez",
              "cargo": "Desarrolladora Junior",
              "correo": "sofia.ramirez@technova.com",
              "tareas": ["Asistir en el desarrollo de módulos de software", "Realizar pruebas unitarias"],
              "fechainicio": "2023-11-01",
              "fechafin": "2024-02-01",
              "clave": "ONB-DEV23"
           },
           ...
       ]
    }
    """
    prompt = (
        "Extrae la información de cada empleado de la sección 'Onboarding de Nuevos Empleados' "
        "del siguiente texto. Devuelve únicamente un JSON con la siguiente estructura:\n"
        '{"employees": [{"nombre": string, "cargo": string, "correo": string, "tareas": [string], '
        '"fechainicio": string, "fechafin": string, "clave": string}]} \n\n'
        "No incluyas texto adicional, solo el JSON. Texto:\n" + text
    )
    
    response = ollama.chat("gemma3", [{"role": "user", "content": prompt}])
    content = response.get("message", {}).get("content", "").strip()
    #print("Respuesta de IA:", content)  # Depuración

    # Eliminar delimitadores markdown si existen
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

def validate_employees(employees: list) -> list:
    """
    Valida que cada registro tenga los campos esenciales.
    Si falta algún campo, se descarta el registro.
    """
    valid_records = []
    required_keys = {"nombre", "cargo", "correo", "tareas", "fechainicio", "fechafin", "clave"}
    for emp in employees:
        if not required_keys.issubset(emp.keys()):
            continue
        # Asegurar que "tareas" sea una lista
        if not isinstance(emp["tareas"], list):
            if isinstance(emp["tareas"], str):
                emp["tareas"] = [t.strip() for t in emp["tareas"].split("|")]
            else:
                emp["tareas"] = []
        valid_records.append(emp)
    return valid_records

@router.post("/upload_pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    token_company_id: str = Depends(verify_token)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")
    
    # Extraer texto completo del PDF
    contents = await file.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
    extracted_text = ""
    for page in pdf_reader.pages:
        page_text = page.extract_text()
        if page_text:
            extracted_text += page_text

    # Encriptar el contenido completo del PDF y guardarlo en "onboarding_data"
    key = os.environ.get("FERNET_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Clave de encriptación no configurada")
    fernet = Fernet(key.encode())
    encrypted_text = fernet.encrypt(extracted_text.encode()).decode()

    # Extraer solo la sección de Onboarding de Nuevos Empleados
    onboarding_section = get_onboarding_section(extracted_text)
    if not onboarding_section:
        print("No se encontró la sección 'Onboarding de Nuevos Empleados'")
    
    # Usar la IA para extraer la información de empleados
    employees_info = extract_employee_info_with_ai(onboarding_section)
    # Validar registros extraídos
    employees_info = validate_employees(employees_info)

    # Actualizar el documento de la empresa con el PDF encriptado
    company_ref = db.collection("companies").document(token_company_id)
    company_ref.update({"onboarding_data": encrypted_text})

    # Crear la subcolección "onboardings" y agregar cada registro
    onboardings_ref = company_ref.collection("onboardings")
    for emp in employees_info:
        # Postprocesado de campos:
        # 1. Ajustar la clave (por ejemplo, eliminar espacios alrededor del guion).
        if "clave" in emp and emp["clave"]:
            import re
            # Sustituye " - " por "-"
            emp["clave"] = re.sub(r"\s*-\s*", "-", emp["clave"])
        
        # 2. Quitar todos los espacios en fechainicio y fechafin
        if "fechainicio" in emp and emp["fechainicio"]:
            emp["fechainicio"] = emp["fechainicio"].replace(" ", "")
        if "fechafin" in emp and emp["fechafin"]:
            emp["fechafin"] = emp["fechafin"].replace(" ", "")
            
        data_doc = {
            "nombre": emp.get("nombre", ""),
            "cargo": emp.get("cargo", ""),
            "correo": emp.get("correo", ""),
            "clave": emp.get("clave", ""),
            "tareas": emp.get("tareas", []),
            "fechainicio": emp.get("fechainicio", ""),
            "fechafin": emp.get("fechafin", ""),
            "estado": "pendiente"
        }
        onboardings_ref.add(data_doc)
    
    return {
        "message": "Archivo PDF procesado y datos actualizados exitosamente",
        "empleados_registrados": len(employees_info)
    }





