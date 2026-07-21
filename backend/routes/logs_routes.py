from datetime import datetime

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
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.utils.route_helpers import (
    get_latest_logs,
    parse_upload,
    resolve_user_upload_by_id,
)

router = APIRouter()


# =========================================================
# LATEST LOGS
# =========================================================

@router.get("/logs")
def get_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, logs = get_latest_logs(
        db,
        current_user,
    )

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "total_logs": len(logs),
        "logs": logs,
    }


# =========================================================
# ANALYSIS BY UPLOAD ID
# =========================================================

@router.get("/analyze-uploaded/id/{upload_id}")
def analyze_uploaded_file(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, file_path = resolve_user_upload_by_id(
        db,
        current_user,
        upload_id,
    )

    logs = parse_upload(file_path)

    classification = classify_logs(logs)
    statistics = analyze_logs(logs)
    anomalies = detect_anomalies(logs)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "total_logs": len(logs),
        "logs": logs,
        "classification": classification,
        "statistics": statistics,
        "anomalies": anomalies,
    }


# =========================================================
# FILTER LOGS
# =========================================================

@router.get("/filter-logs/id/{upload_id}")
def filter_uploaded_logs(
    upload_id: int,
    level: str = None,
    keyword: str = None,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, file_path = resolve_user_upload_by_id(
        db,
        current_user,
        upload_id,
    )

    logs = parse_upload(file_path)

    parsed_start = None
    parsed_end = None

    try:
        if start_date:
            parsed_start = datetime.strptime(
                start_date,
                "%Y-%m-%d %H:%M:%S",
            )

        if end_date:
            parsed_end = datetime.strptime(
                end_date,
                "%Y-%m-%d %H:%M:%S",
            )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail="Dates must use YYYY-MM-DD HH:MM:SS format",
        ) from error

    normalized_level = (
        level.lower()
        if level
        else None
    )

    normalized_keyword = (
        keyword.lower()
        if keyword
        else None
    )

    filtered_logs = []

    for log in logs:

        if normalized_level:
            log_level = str(
                log.get("level", "")
            ).lower()

            if log_level != normalized_level:
                continue

        if normalized_keyword:
            searchable_content = " ".join(
                str(log.get(field, ""))
                for field in (
                    "message",
                    "module",
                    "service",
                    "error_code",
                )
            ).lower()

            if normalized_keyword not in searchable_content:
                continue

        if parsed_start or parsed_end:

            try:
                log_time = datetime.strptime(
                    log["timestamp"],
                    "%Y-%m-%d %H:%M:%S",
                )

            except (
                KeyError,
                TypeError,
                ValueError,
            ):
                continue

            if parsed_start and log_time < parsed_start:
                continue

            if parsed_end and log_time > parsed_end:
                continue

        filtered_logs.append(log)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "total_results": len(filtered_logs),
        "filters": {
            "level": level,
            "keyword": keyword,
            "start_date": start_date,
            "end_date": end_date,
        },
        "logs": filtered_logs,
    }