from fastapi import APIRouter
from app.services.firebase import db

router = APIRouter()

@router.post("/register")
def register_company(data: dict):
    """
    Registra una nueva empresa en la base de datos.
    """
    company_ref = db.collection("companies").document()
    company_ref.set(data)
    return {"message": "Empresa registrada exitosamente", "id": company_ref.id}

@router.post("/login")
def login_company(data: dict):
    """
    Autenticación básica de la empresa.
    """
    company_name = data.get("company_name")
    password = data.get("password")

    companies = db.collection("companies").where("company_name", "==", company_name).get()

    for company in companies:
        if company.to_dict().get("password") == password:
            return {"message": "Login exitoso", "id": company.id}

    return {"message": "Credenciales incorrectas"}, 401
