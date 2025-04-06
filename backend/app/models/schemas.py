# app/models/auth_schemas.py

from pydantic import BaseModel

class CompanyRegister(BaseModel):
    company_name: str
    password: str

class CompanyLogin(BaseModel):
    company_name: str
    password: str