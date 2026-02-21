from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class UploadResponse(BaseModel):
    prediction: str
    confidence: float
    duplicate: bool
    approved: bool
    points_added: int

class UploadHistory(BaseModel):
    id: UUID
    image_url: str
    prediction: str
    confidence: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    points: int
    total_approved: int
    total_rejected: int
    history: List[UploadHistory]

class RewardSchema(BaseModel):
    id: int
    reward_name: str
    description: Optional[str]
    points_required: int
    available_quantity: int
    
    class Config:
        from_attributes = True

class RedemptionResponse(BaseModel):
    message: str
    reward_name: str
    points_remaining: int

class WithdrawalRequest(BaseModel):
    points_amount: int
    payment_method: str
    payment_details: str

class WithdrawalResponse(BaseModel):
    id: UUID
    points_amount: int
    currency_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
