from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.reward import Reward, Redemption
from app.schemas.app_schemas import RewardSchema, RedemptionResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/rewards", tags=["Rewards"])

@router.get("/", response_model=List[RewardSchema])
def list_rewards(db: Session = Depends(get_db)):
    """Return all available rewards"""
    return db.query(Reward).all()

@router.post("/redeem/{reward_id}", response_model=RedemptionResponse)
def redeem_reward(
    reward_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if reward.available_quantity <= 0:
        raise HTTPException(status_code=400, detail="Reward is out of stock")
        
    if current_user.points < reward.points_required:
        raise HTTPException(status_code=400, detail="Not enough points to redeem this reward")
    
    # Process redemption transaction
    try:
        current_user.points -= reward.points_required
        reward.available_quantity -= 1
        
        new_redemption = Redemption(
            user_id=current_user.id,
            reward_id=reward.id
        )
        db.add(new_redemption)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Transaction failed")

    return {
        "message": "Reward redeemed successfully!",
        "reward_name": reward.reward_name,
        "points_remaining": current_user.points
    }
