from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

from backend.analyzer import analyze_logs
from backend.anomaly_detector import detect_anomalies
from backend.classifier import classify_logs
from backend.database import get_db
from backend.models.upload_model import Upload
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.upload_service import get_upload_path
from backend.utils.route_helpers import (
    get_latest_logs,
    parse_upload,
)

router = APIRouter()


# =========================================================
# LATEST FILE ANALYSIS
# =========================================================

@router.get("/analysis")
def get_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, logs = get_latest_logs(
        db,
        current_user,
    )

    classification = classify_logs(logs)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "total_logs": len(logs),
        "classification": classification,
    }


# =========================================================
# LATEST FILE STATISTICS
# =========================================================

@router.get("/statistics")
def get_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, logs = get_latest_logs(
        db,
        current_user,
    )

    statistics = analyze_logs(logs)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        **statistics,
    }


# =========================================================
# LATEST FILE ANOMALIES
# =========================================================

@router.get("/anomalies")
def get_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, logs = get_latest_logs(
        db,
        current_user,
    )

    anomalies = detect_anomalies(logs)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "total_anomalies": len(anomalies),
        "anomalies": anomalies,
    }


# =========================================================
# STATISTICS BY UPLOAD ID
# =========================================================

@router.get("/statistics/id/{upload_id}")
def get_statistics_by_upload_id(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = (
        db.query(Upload)
        .filter(
            Upload.id == upload_id,
            Upload.user_id == current_user.id,
        )
        .first()
    )

    if not upload:
        raise HTTPException(
            status_code=404,
            detail="Upload not found",
        )

    file_path = get_upload_path(upload)
    logs = parse_upload(file_path)

    statistics = analyze_logs(logs)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        **statistics,
    }