from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.upload_model import Upload
from backend.models.user_model import User
from backend.parser import parse_log_file
from backend.services.upload_service import (
    get_upload_path,
    get_user_upload_by_id,
)


def get_latest_user_upload(
    db: Session,
    user_id: int,
):
    upload = (
        db.query(Upload)
        .filter(
            Upload.user_id == user_id,
            Upload.status == "processed",
        )
        .order_by(
            Upload.created_at.desc(),
            Upload.id.desc(),
        )
        .first()
    )

    if not upload:
        raise HTTPException(
            status_code=404,
            detail="No uploaded log file found",
        )

    return upload


def resolve_user_upload_by_id(
    db: Session,
    current_user: User,
    upload_id: int,
):
    upload = get_user_upload_by_id(
        db=db,
        user_id=current_user.id,
        upload_id=upload_id,
    )

    file_path = get_upload_path(upload)

    return upload, file_path


def parse_upload(file_path: Path):
    try:
        return parse_log_file(str(file_path))

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse log file: {error}",
        ) from error


def get_latest_logs(
    db: Session,
    current_user: User,
):
    upload = get_latest_user_upload(
        db=db,
        user_id=current_user.id,
    )

    file_path = get_upload_path(upload)
    logs = parse_upload(file_path)

    return upload, logs