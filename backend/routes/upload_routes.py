from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from backend.analyzer import analyze_logs
from backend.anomaly_detector import detect_anomalies
from backend.database import get_db
from backend.models.upload_model import Upload
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.upload_service import (
    get_upload_path,
    get_user_upload_by_id,
    save_user_upload,
)
from backend.utils.route_helpers import parse_upload

router = APIRouter()


# =========================================================
# SECURE USER UPLOAD
# =========================================================

@router.post("/upload")
async def upload_log_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = await save_user_upload(
        file=file,
        db=db,
        user_id=current_user.id,
    )

    try:
        file_path = get_upload_path(upload)

        logs = parse_upload(file_path)

        upload.total_logs = len(logs)
        upload.status = "processed"

        db.commit()
        db.refresh(upload)

        statistics = analyze_logs(logs)
        anomalies = detect_anomalies(logs)

        return {
            "message": "File uploaded successfully",
            "filename": upload.original_filename,
            "upload_id": upload.id,
            "file_size": upload.file_size,
            "total_logs": upload.total_logs,
            "status": upload.status,
            "logs": logs,
            "statistics": statistics,
            "anomalies": anomalies,
        }

    except Exception:
        db.rollback()

        try:
            upload.status = "failed"
            db.add(upload)
            db.commit()

        except Exception:
            db.rollback()

        raise


# =========================================================
# UPLOAD HISTORY
# =========================================================

@router.get("/uploads/history")
def get_upload_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    uploads = (
        db.query(Upload)
        .filter(Upload.user_id == current_user.id)
        .order_by(
            Upload.created_at.desc(),
            Upload.id.desc(),
        )
        .all()
    )

    return {
        "total_uploads": len(uploads),
        "uploads": [
            {
                "id": upload.id,
                "filename": upload.original_filename,
                "file_size": upload.file_size,
                "total_logs": upload.total_logs,
                "status": upload.status,
                "created_at": upload.created_at,
            }
            for upload in uploads
        ],
    }


# =========================================================
# DELETE UPLOAD
# =========================================================

@router.delete("/uploads/{upload_id}")
def delete_upload(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload = get_user_upload_by_id(
        db=db,
        user_id=current_user.id,
        upload_id=upload_id,
    )

    file_path = get_upload_path(upload)

    report_directory = (
        Path("backend/reports")
        / str(current_user.id)
    )

    csv_report = (
        report_directory
        / f"upload_{upload.id}_report.csv"
    )

    pdf_report = (
        report_directory
        / f"upload_{upload.id}_report.pdf"
    )

    try:
        if file_path.exists():
            file_path.unlink()

        if csv_report.exists():
            csv_report.unlink()

        if pdf_report.exists():
            pdf_report.unlink()

        db.delete(upload)
        db.commit()

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete upload: {error}",
        ) from error

    return {
        "message": "Upload deleted successfully",
        "upload_id": upload_id,
    }