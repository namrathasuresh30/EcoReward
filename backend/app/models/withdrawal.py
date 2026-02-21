import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, func, Float, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    points_amount = Column(Integer, nullable=False)
    currency_amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False) # e.g., 'PayPal', 'UPI', 'Bank Transfer'
    payment_details = Column(String(255), nullable=False) # e.g., email or account number
    status = Column(String(20), default="pending") # 'pending', 'completed', 'rejected'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="withdrawals")
