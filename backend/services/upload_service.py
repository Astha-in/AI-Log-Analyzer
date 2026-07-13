import os
from pathlib import Path
from uuid import uuid4

from fastapi import (
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from backend.models.upload_model import Upload


UPLOAD_DIRECTORY = Path("backend/uploads")

ALLOWED_EXTENSIONS = {
    ".log",
    ".txt",
}

MAX_FILE_SIZE = 10 * 1024 * 1024
UPLOAD_CHUNK_SIZE = 1024 * 1024


# =========================================================
# GET USER UPLOAD BY FILENAME
# =========================================================


def get_user_upload(
    db: Session,
    user_id: int,
    filename: str,
):
    upload = (
        db.query(Upload)
        .filter(
            Upload.user_id == user_id,
            Upload.original_filename == filename,
        )
        .order_by(
            Upload.created_at.desc(),
            Upload.id.desc(),
        )
        .first()
    )

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found",
        )

    return upload


# =========================================================
# GET USER UPLOAD BY ID
# =========================================================


def get_user_upload_by_id(
    db: Session,
    user_id: int,
    upload_id: int,
):
    upload = (
        db.query(Upload)
        .filter(
            Upload.id == upload_id,
            Upload.user_id == user_id,
        )
        .first()
    )

    if not upload:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upload not found",
        )

    return upload


# =========================================================
# SECURE UPLOAD PATH
# =========================================================


def get_upload_path(
    upload: Upload,
) -> Path:
    upload_root = (
        UPLOAD_DIRECTORY.resolve()
    )

    user_directory = (
        upload_root / str(upload.user_id)
    ).resolve()

    file_path = (
        user_directory /
        upload.stored_filename
    ).resolve()

    if (
        user_directory.parent != upload_root
        or file_path.parent != user_directory
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file path",
        )

    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found",
        )

    return file_path


# =========================================================
# SAVE USER UPLOAD
# =========================================================


async def save_user_upload(
    file: UploadFile,
    db: Session,
    user_id: int,
):
    original_filename = os.path.basename(
        file.filename or ""
    )

    if not original_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required",
        )

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only .log and .txt files "
                "are allowed"
            ),
        )

    upload_root = (
        UPLOAD_DIRECTORY.resolve()
    )

    user_directory = (
        upload_root / str(user_id)
    ).resolve()

    if user_directory.parent != upload_root:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid upload directory",
        )

    user_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    stored_filename = (
        f"{uuid4().hex}{extension}"
    )

    file_path = (
        user_directory /
        stored_filename
    )

    total_size = 0

    try:
        with file_path.open(
            "wb"
        ) as destination:
            while True:
                chunk = await file.read(
                    UPLOAD_CHUNK_SIZE
                )

                if not chunk:
                    break

                total_size += len(chunk)

                if (
                    total_size >
                    MAX_FILE_SIZE
                ):
                    raise HTTPException(
                        status_code=(
                            status
                            .HTTP_413_REQUEST_ENTITY_TOO_LARGE
                        ),
                        detail=(
                            "File exceeds the "
                            "10 MB upload limit"
                        ),
                    )

                destination.write(chunk)

        upload = Upload(
            original_filename=(
                original_filename
            ),
            stored_filename=(
                stored_filename
            ),
            user_id=user_id,
            file_size=total_size,
            total_logs=0,
            status="uploaded",
        )

        db.add(upload)
        db.commit()
        db.refresh(upload)

        return upload

    except Exception:
        db.rollback()

        if file_path.exists():
            file_path.unlink()

        raise

    finally:
        await file.close()