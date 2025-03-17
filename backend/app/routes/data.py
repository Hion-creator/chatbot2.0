from fastapi import APIRouter
from app.services.firebase import db

router = APIRouter()

@router.post("/upload_data")
def upload_company_data(data: dict, company_id: str):
    """
    Permite subir datos de la empresa (por ejemplo, misión, visión y tareas) en formato JSON.
    """
    company_ref = db.collection("companies").document(company_id)
    company_ref.update(data)
    return {"message": "Datos actualizados exitosamente"}
