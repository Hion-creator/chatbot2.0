# app/routes/auth.py
from fastapi import APIRouter, HTTPException
from app.services.firebase import db
from app.security import create_access_token
from datetime import timedelta
import bcrypt

router = APIRouter()

@router.post("/register")
def register_company(data: dict):
    # Hashear la contraseña antes de guardarla
    if "password" not in data:
        raise HTTPException(status_code=400, detail="Se requiere contraseña")
    plain_password = data["password"]
    hashed_password = bcrypt.hashpw(plain_password.encode(), bcrypt.gensalt()).decode()
    data["password"] = hashed_password

    company_ref = db.collection("companies").document()
    company_ref.set(data)
    return {"message": "Empresa registrada exitosamente", "id": company_ref.id}

@router.post("/login")
def login_company(user_input: dict):
    company_name = user_input.get("company_name")
    password = user_input.get("password")
    companies = db.collection("companies").where("company_name", "==", company_name).get()
    for company in companies:
        company_data = company.to_dict()
        stored_password = company_data.get("password")
        if stored_password and bcrypt.checkpw(password.encode(), stored_password.encode()):
            token = create_access_token({"sub": company.id}, expires_delta=timedelta(minutes=60))
            return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

