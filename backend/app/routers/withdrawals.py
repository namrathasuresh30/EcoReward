from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.withdrawal import Withdrawal
from app.schemas.app_schemas import WithdrawalRequest, WithdrawalResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])

# Conversion rate: 10 points = 10 Rupees (1 point = 1 Rupee)
CONVERSION_RATE = 1.0

@router.post("/", response_model=WithdrawalResponse)
def request_withdrawal(
    withdrawal_in: WithdrawalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if withdrawal_in.points_amount <= 0:
        raise HTTPException(status_code=400, detail="Points amount must be greater than zero")
    
    if current_user.points < withdrawal_in.points_amount:
        raise HTTPException(status_code=400, detail="Insufficient points for this withdrawal")
    
    currency_amount = round(withdrawal_in.points_amount * CONVERSION_RATE, 2)
    
    try:
        # Deduct points
        current_user.points -= withdrawal_in.points_amount
        
        # Create withdrawal record
        new_withdrawal = Withdrawal(
            user_id=current_user.id,
            points_amount=withdrawal_in.points_amount,
            currency_amount=currency_amount,
            payment_method=withdrawal_in.payment_method,
            payment_details=withdrawal_in.payment_details,
            status="pending"
        )
        db.add(new_withdrawal)
        db.commit()
        db.refresh(new_withdrawal)
        return new_withdrawal
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process withdrawal: {str(e)}")

@router.get("/my", response_model=List[WithdrawalResponse])
def get_my_withdrawals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Withdrawal).filter(Withdrawal.user_id == current_user.id).order_by(Withdrawal.created_at.desc()).all()
