from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from app.services.firebase import db
from app.security import verify_token
import PyPDF2
import io
import os
from cryptography.fernet import Fernet

router = APIRouter()

@router.post("/upload_pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    token_company_id: str = Depends(verify_token)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF")
    
    contents = await file.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
    extracted_text = ""
    for page in pdf_reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text

    # Obtener la clave de encriptación de las variables de entorno
    key = os.environ.get("FERNET_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Clave de encriptación no configurada")
    
    fernet = Fernet(key.encode())
    # Cifrar el texto extraído
    encrypted_text = fernet.encrypt(extracted_text.encode()).decode()
    
    company_ref = db.collection("companies").document(token_company_id)
    company_ref.update({"onboarding_data": encrypted_text})
    return {"message": "Archivo PDF procesado, datos encriptados y actualizados exitosamente"}

