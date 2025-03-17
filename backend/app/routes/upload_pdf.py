from fastapi import APIRouter, UploadFile, File, Form
from app.services.firebase import db
import PyPDF2
import io

router = APIRouter()

@router.post("/upload_pdf")
async def upload_pdf(company_id: str = Form(...), file: UploadFile = File(...)):
    """
    Permite subir un archivo PDF. Se procesa para extraer el texto y se guarda en Firebase
    en el campo 'onboarding_data' del registro de la empresa.
    """
    if file.content_type != "application/pdf":
        return {"error": "El archivo debe ser un PDF"}
    
    contents = await file.read()
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
    extracted_text = ""
    for page in pdf_reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text

    company_ref = db.collection("companies").document(company_id)
    company_ref.update({"onboarding_data": extracted_text})
    return {"message": "Archivo PDF procesado y datos actualizados exitosamente"}
