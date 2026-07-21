from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.orm import Session

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


def build_chart_data(logs):
    level_counts = {
        "INFO": 0,
        "DEBUG": 0,
        "WARNING": 0,
        "ERROR": 0,
        "CRITICAL": 0,
    }

    hourly_counts = {}

    for log in logs:
        level = str(
            log.get("level", "")
        ).upper()

        if level in level_counts:
            level_counts[level] += 1

        timestamp = log.get("timestamp")

        if not timestamp:
            continue

        try:
            hour = datetime.strptime(
                timestamp,
                "%Y-%m-%d %H:%M:%S",
            ).strftime("%H:00")

        except (TypeError, ValueError):
            continue

        hourly_counts[hour] = (
            hourly_counts.get(hour, 0) + 1
        )

    return {
        "log_distribution": [
            {
                "level": level,
                "count": count,
            }
            for level, count in level_counts.items()
        ],
        "hourly_activity": [
            {
                "hour": hour,
                "count": count,
            }
            for hour, count in sorted(
                hourly_counts.items()
            )
        ],
    }


# =========================================================
# LATEST FILE CHARTS
# =========================================================

@router.get("/charts")
def get_charts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    upload, logs = get_latest_logs(
        db,
        current_user,
    )

    charts = build_chart_data(logs)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        **charts,
    }


# =========================================================
# CHARTS BY UPLOAD ID
# =========================================================

@router.get("/charts/id/{upload_id}")
def get_charts_by_upload_id(
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

    charts = build_chart_data(logs)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        **charts,
    }