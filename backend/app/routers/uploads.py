import os
import hashlib
import uuid
import shutil
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.user import User
from app.models.upload import Upload
from app.schemas.app_schemas import UploadResponse, DashboardStats, UploadHistory
from app.utils.security import get_current_user
from app.services.ai_service import predict_image

router = APIRouter(prefix="/uploads", tags=["Uploads"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploaded_images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = ["image/jpeg", "image/png"]
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB

@router.post("/", response_model=UploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    product_code: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG and PNG are allowed.")

    # Read file content
    content = await file.read()
    
    # 2. Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
    
    # 3. Generate Image Fingerprint (SHA-256)
    image_hash = hashlib.sha256(content).hexdigest()

    # 4. Check for duplicate image globally
    existing_upload = db.query(Upload).filter(Upload.image_hash == image_hash).first()
    if existing_upload:
        return UploadResponse(
            prediction="Duplicate Image",
            confidence=1.0,
            duplicate=True,
            approved=False,
            points_added=0
        )

    # 5. Save the image locally (In production, this could be S3)
    file_ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    image_url = f"/uploaded_images/{unique_filename}"

    # 6. AI Verification
    prediction, confidence = await predict_image(content)

    # 7. Decision Logic
    is_valid_trash = (prediction == "Proper Trash Disposal" and confidence >= 0.80)
    
    points_added = 0
    status_str = "rejected"
    
    if is_valid_trash:
        points_added = 10
        status_str = "approved"

    # 8. Database Transaction
    try:
        new_upload = Upload(
            user_id=current_user.id,
            image_url=image_url,
            image_hash=image_hash,
            product_code=product_code,
            prediction=prediction,
            confidence=confidence,
            status=status_str
        )
        db.add(new_upload)
        
        if points_added > 0:
            current_user.points += points_added
            
        db.commit()
        db.refresh(new_upload)
        
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Duplicate image hash detected during transaction.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return UploadResponse(
        prediction=prediction,
        confidence=confidence,
        duplicate=False,
        approved=is_valid_trash,
        points_added=points_added
    )

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_uploads = db.query(Upload).filter(Upload.user_id == current_user.id).all()
    
    total_approved = sum(1 for u in user_uploads if u.status == "approved")
    total_rejected = sum(1 for u in user_uploads if u.status == "rejected")
    
    history = [
        UploadHistory(
            id=u.id,
            image_url=u.image_url,
            prediction=u.prediction,
            confidence=u.confidence,
            status=u.status,
            created_at=u.created_at
        ) for u in sorted(user_uploads, key=lambda x: x.created_at, reverse=True)
    ]

    return DashboardStats(
        points=current_user.points,
        total_approved=total_approved,
        total_rejected=total_rejected,
        history=history
    )
