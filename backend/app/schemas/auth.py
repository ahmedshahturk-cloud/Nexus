import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)

    @field_validator("password")
    @classmethod
    def password_must_contain_digit(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least 1 digit")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
