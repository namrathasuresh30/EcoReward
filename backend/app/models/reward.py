from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    reward_name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    points_required = Column(Integer, nullable=False)
    available_quantity = Column(Integer, default=100)

    redemptions = relationship("Redemption", back_populates="reward")


class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(ForeignKey("users.id"), nullable=False)
    reward_id = Column(ForeignKey("rewards.id"), nullable=False)
    redeemed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="redemptions")
    reward = relationship("Reward", back_populates="redemptions")
