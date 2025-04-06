# app/routes/auth.py
from fastapi import APIRouter, HTTPException
from app.models.schemas import CompanyRegister, CompanyLogin
from app.services.firebase import db
from app.security import create_access_token
from datetime import timedelta
import bcrypt

router = APIRouter()

@router.post("/register")
def register_company(data: CompanyRegister):

    # Verificar si la empresa ya existe
    existing_companies = db.collection("companies").where("company_name", "==", data.company_name).get()
    if existing_companies:
        raise HTTPException(status_code=400, detail="El nombre de la empresa ya está registrado")

    # Hashear la contraseña
    hashed_password = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()

    # Preparar datos para guardar
    company_data = {
        "company_name": data.company_name,
        "password": hashed_password
    }

    # Guardar en la base de datos
    company_ref = db.collection("companies").document()
    company_ref.set(company_data)

    return {"message": "Empresa registrada exitosamente", "id": company_ref.id}

@router.post("/login")
def login_company(user_input: CompanyLogin):
    company_name = user_input.company_name
    password = user_input.password

    companies = db.collection("companies").where("company_name", "==", company_name).get()

    if not companies:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    for company in companies:
        company_data = company.to_dict()
        stored_password = company_data.get("password")

        if stored_password and bcrypt.checkpw(password.encode(), stored_password.encode()):
            token = create_access_token({"sub": company.id}, expires_delta=timedelta(minutes=60))
            return {"access_token": token, "token_type": "bearer"}

    raise HTTPException(status_code=401, detail="Credenciales incorrectas")
