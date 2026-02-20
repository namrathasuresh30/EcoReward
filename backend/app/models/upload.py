import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Upload(Base):
    __tablename__ = "uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=False)
    image_hash = Column(String(64), unique=True, index=True, nullable=False)
    product_code = Column(String(255), nullable=True)
    prediction = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    status = Column(String(20), nullable=False) # 'approved' or 'rejected'
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="uploads")
