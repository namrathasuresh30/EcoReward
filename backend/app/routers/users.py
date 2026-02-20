from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserResponse
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user
