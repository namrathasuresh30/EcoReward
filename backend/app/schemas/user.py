from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    points: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
