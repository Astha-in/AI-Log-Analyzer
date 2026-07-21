from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.analysis_service import build_analysis
from backend.utils.route_helpers import resolve_user_upload_by_id

router = APIRouter()


# =========================================================
# AI SUMMARY BY UPLOAD ID
# =========================================================

@router.get("/ai-summary/id/{upload_id}")
def get_ai_summary(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, _ = resolve_user_upload_by_id(
        db,
        current_user,
        upload_id,
    )

    analysis = build_analysis(
        db=db,
        upload=upload,
        user_id=current_user.id,
    )

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "ai_summary": analysis.ai_summary,
    }