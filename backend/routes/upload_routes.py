from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    UploadFile,
)
from sqlalchemy.orm import Session

from backend.analyzer import analyze_logs
from backend.anomaly_detector import detect_anomalies
from backend.core.logger import logger
from backend.core.rate_limiter import rate_limit
from backend.core.redis_client import redis_client
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
    http_request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rate_limit(
        request=http_request,
        key_prefix="upload",
        limit=10,
        window=3600,
    )

    logger.info(
        f"Upload request received from user {current_user.id}"
    )

    upload = await save_user_upload(
        file=file,
        db=db,
        user_id=current_user.id,
    )

    logger.info(
        f"File uploaded: {upload.original_filename} "
        f"(Upload ID: {upload.id})"
    )

    try:
        file_path = get_upload_path(upload)

        logs = parse_upload(file_path)

        upload.total_logs = len(logs)
        upload.status = "processed"

        db.commit()
        db.refresh(upload)

        logger.info(
            f"Upload processed successfully "
            f"(Upload ID: {upload.id}, Logs: {upload.total_logs})"
        )

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

        logger.exception(
            f"Upload processing failed "
            f"(Upload ID: {upload.id})"
        )

        db.rollback()

        try:
            upload.status = "failed"
            db.add(upload)
            db.commit()

        except Exception:

            logger.exception(
                f"Failed updating upload status "
                f"(Upload ID: {upload.id})"
            )

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

    logger.info(
        f"Upload history requested by user {current_user.id}"
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

    cache_key = f"ai_summary:{current_user.id}:{upload.id}"

    try:
        if file_path.exists():
            file_path.unlink()

        if csv_report.exists():
            csv_report.unlink()

        if pdf_report.exists():
            pdf_report.unlink()

        # Remove cached AI summary
        redis_client.delete(cache_key)

        db.delete(upload)
        db.commit()

        logger.info(
            f"Upload deleted successfully "
            f"(User: {current_user.id}, Upload: {upload.id})"
        )

    except Exception as error:

        logger.exception(
            f"Failed to delete upload "
            f"(User: {current_user.id}, Upload: {upload.id})"
        )

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete upload: {error}",
        ) from error

    return {
        "message": "Upload deleted successfully",
        "upload_id": upload_id,
    }