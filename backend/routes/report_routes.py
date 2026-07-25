import csv
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.core.logger import logger
from backend.database import get_db
from backend.models.user_model import User
from backend.report_generator import generate_pdf_report
from backend.routes.auth_routes import get_current_user
from backend.services.analysis_service import build_analysis
from backend.utils.route_helpers import (
    parse_upload,
    resolve_user_upload_by_id,
)

router = APIRouter()


# =========================================================
# CSV REPORT
# =========================================================

@router.get("/report/csv/id/{upload_id}")
def download_csv_report(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(
        f"CSV report requested "
        f"(User: {current_user.id}, Upload: {upload_id})"
    )

    upload, file_path = resolve_user_upload_by_id(
        db,
        current_user,
        upload_id,
    )

    logs = parse_upload(file_path)

    if not logs:
        logger.warning(
            f"No valid logs found for CSV report "
            f"(Upload: {upload_id})"
        )

        raise HTTPException(
            status_code=400,
            detail="No valid log entries found in file",
        )

    report_directory = (
        Path("backend/reports")
        / str(current_user.id)
    )

    report_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    report_filename = (
        f"upload_{upload.id}_report.csv"
    )

    report_path = (
        report_directory
        / report_filename
    )

    fieldnames = [
        "timestamp",
        "level",
        "module",
        "service",
        "error_code",
        "message",
    ]

    try:
        with report_path.open(
            "w",
            newline="",
            encoding="utf-8",
        ) as csv_file:

            writer = csv.DictWriter(
                csv_file,
                fieldnames=fieldnames,
                extrasaction="ignore",
            )

            writer.writeheader()

            for log in logs:
                writer.writerow(
                    {
                        field: log.get(
                            field,
                            "",
                        )
                        for field in fieldnames
                    }
                )

        logger.info(
            f"CSV report generated successfully "
            f"(Upload: {upload.id})"
        )

    except Exception:
        logger.exception(
            f"CSV report generation failed "
            f"(Upload: {upload.id})"
        )
        raise

    return FileResponse(
        path=str(report_path),
        media_type="text/csv",
        filename=(
            f"{Path(upload.original_filename).stem}_report.csv"
        ),
    )


# =========================================================
# PDF REPORT
# =========================================================

@router.get("/report/pdf/id/{upload_id}")
def download_pdf_report(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(
        f"PDF report requested "
        f"(User: {current_user.id}, Upload: {upload_id})"
    )

    upload, file_path = resolve_user_upload_by_id(
        db,
        current_user,
        upload_id,
    )

    logs = parse_upload(file_path)

    if not logs:
        logger.warning(
            f"No valid logs found for PDF report "
            f"(Upload: {upload.id})"
        )

        raise HTTPException(
            status_code=400,
            detail="No valid log entries found in file",
        )

    analysis = build_analysis(
        db=db,
        upload=upload,
        user_id=current_user.id,
    )

    report_directory = (
        Path("backend/reports")
        / str(current_user.id)
    )

    report_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    report_filename = (
        f"upload_{upload.id}_report.pdf"
    )

    report_path = (
        report_directory
        / report_filename
    )

    if report_path.exists():

        logger.info(
            f"Serving cached PDF report "
            f"(Upload: {upload.id})"
        )

        return FileResponse(
            path=str(report_path),
            media_type="application/pdf",
            filename=(
                f"{Path(upload.original_filename).stem}_report.pdf"
            ),
        )

    try:
        generate_pdf_report(
            report_path=str(report_path),
            filename=upload.original_filename,
            logs=logs,
            statistics=analysis.statistics,
            anomalies=analysis.anomalies,
            ai_summary=analysis.ai_summary,
        )

        logger.info(
            f"PDF report generated successfully "
            f"(Upload: {upload.id})"
        )

    except Exception:
        logger.exception(
            f"PDF generation failed "
            f"(Upload: {upload.id})"
        )

        raise HTTPException(
            status_code=500,
            detail="PDF generation failed.",
        )

    return FileResponse(
        path=str(report_path),
        media_type="application/pdf",
        filename=(
            f"{Path(upload.original_filename).stem}_report.pdf"
        ),
    )