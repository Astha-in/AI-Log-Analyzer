import csv
from datetime import datetime
from pathlib import Path

from fastapi import (
    Depends,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.analyzer import analyze_logs
from backend.anomaly_detector import detect_anomalies
from backend.classifier import classify_logs
from backend.database import get_db
from backend.models.upload_model import Upload
from backend.models.user_model import User
from backend.parser import parse_log_file
from backend.report_generator import generate_pdf_report
from backend.routes.auth_routes import (
    get_current_user,
    router as auth_router,
)
from backend.services.analysis_service import build_analysis
from backend.services.upload_service import (
    get_upload_path,
    get_user_upload_by_id,
    save_user_upload,
)
from backend.visualization import generate_chart_data


app = FastAPI(
    title="AI Log Analyzer API",
    description="Secure AI-powered log analysis API",
    version="1.0.0",
)

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# HELPERS
# =========================================================


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


def parse_upload(
    file_path: Path,
):
    try:
        return parse_log_file(
            str(file_path)
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=(
                "Failed to parse log file: "
                f"{str(error)}"
            ),
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


# =========================================================
# PUBLIC ROUTES
# =========================================================


@app.get("/")
def home():
    return {
        "message": (
            "AI Log Analyzer API is running"
        )
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# =========================================================
# PROTECTED LATEST LOG ROUTES
# =========================================================


@app.get("/logs")
def get_logs(
    current_user: User = Depends(
        get_current_user
    ),
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


@app.get("/analysis")
def get_analysis(
    current_user: User = Depends(
        get_current_user
    ),
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


@app.get("/statistics")
def get_statistics(
    current_user: User = Depends(
        get_current_user
    ),
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


@app.get("/anomalies")
def get_anomalies(
    current_user: User = Depends(
        get_current_user
    ),
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
# SECURE USER UPLOAD
# =========================================================


@app.post("/upload")
async def upload_log_file(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
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
            "message": (
                "File uploaded successfully"
            ),
            "filename": (
                upload.original_filename
            ),
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


@app.get("/uploads/history")
def get_upload_history(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    uploads = (
        db.query(Upload)
        .filter(
            Upload.user_id == current_user.id
        )
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
                "filename": (
                    upload.original_filename
                ),
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


@app.delete("/uploads/{upload_id}")
def delete_upload(
    upload_id: int,
    current_user: User = Depends(
        get_current_user
    ),
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
            detail=(
                "Failed to delete upload: "
                f"{str(error)}"
            ),
        ) from error

    return {
        "message": (
            "Upload deleted successfully"
        ),
        "upload_id": upload_id,
    }


# =========================================================
# UPLOAD ANALYSIS BY ID
# =========================================================


@app.get(
    "/analyze-uploaded/id/{upload_id}"
)
def analyze_uploaded_file(
    upload_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    upload, file_path = (
        resolve_user_upload_by_id(
            db,
            current_user,
            upload_id,
        )
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
# FILTER LOGS BY ID
# =========================================================


@app.get(
    "/filter-logs/id/{upload_id}"
)
def filter_uploaded_logs(
    upload_id: int,
    level: str = None,
    keyword: str = None,
    start_date: str = None,
    end_date: str = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    upload, file_path = (
        resolve_user_upload_by_id(
            db,
            current_user,
            upload_id,
        )
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
            detail=(
                "Dates must use "
                "YYYY-MM-DD HH:MM:SS format"
            ),
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
            log_level = (
                log.get("level", "")
                .lower()
            )

            if (
                log_level
                != normalized_level
            ):
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

            if (
                normalized_keyword
                not in searchable_content
            ):
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

            if (
                parsed_start
                and log_time < parsed_start
            ):
                continue

            if (
                parsed_end
                and log_time > parsed_end
            ):
                continue

        filtered_logs.append(log)

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "total_results": len(
            filtered_logs
        ),
        "filters": {
            "level": level,
            "keyword": keyword,
            "start_date": start_date,
            "end_date": end_date,
        },
        "logs": filtered_logs,
    }


# =========================================================
# CHARTS BY ID
# =========================================================


@app.get("/charts/id/{upload_id}")
def get_chart_data(
    upload_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    upload, file_path = (
        resolve_user_upload_by_id(
            db,
            current_user,
            upload_id,
        )
    )

    logs = parse_upload(file_path)

    chart_data = generate_chart_data(
        logs
    )

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "charts": chart_data,
    }
@app.get("/statistics/id/{upload_id}")
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


@app.get("/charts/id/{upload_id}")
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

        except ValueError:
            continue

        hourly_counts[hour] = (
            hourly_counts.get(hour, 0) + 1
        )

    log_distribution = [
        {
            "level": level,
            "count": count,
        }
        for level, count
        in level_counts.items()
    ]

    hourly_activity = [
        {
            "hour": hour,
            "count": count,
        }
        for hour, count
        in sorted(hourly_counts.items())
    ]

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "log_distribution": log_distribution,
        "hourly_activity": hourly_activity,
    }


# LATEST FILE DASHBOARD CHARTS


@app.get("/charts")
def get_charts(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    upload, logs = get_latest_logs(
        db,
        current_user,
    )

    level_counts = {
        "INFO": 0,
        "DEBUG": 0,
        "WARNING": 0,
        "ERROR": 0,
        "CRITICAL": 0,
    }

    hourly_counts = {}

    for log in logs:
        level = (
            log.get("level", "")
            .upper()
        )

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

        except (
            TypeError,
            ValueError,
        ):
            continue

        hourly_counts[hour] = (
            hourly_counts.get(
                hour,
                0,
            )
            + 1
        )

    log_distribution = [
        {
            "level": level,
            "count": count,
        }
        for level, count
        in level_counts.items()
    ]

    hourly_activity = [
        {
            "hour": hour,
            "count": count,
        }
        for hour, count
        in sorted(
            hourly_counts.items()
        )
    ]

    return {
        "filename": upload.original_filename,
        "upload_id": upload.id,
        "log_distribution": (
            log_distribution
        ),
        "hourly_activity": (
            hourly_activity
        ),
    }



# AI SUMMARY BY ID


@app.get(
    "/ai-summary/id/{upload_id}"
)
def get_ai_summary(
    upload_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    upload, _ = (
        resolve_user_upload_by_id(
            db,
            current_user,
            upload_id,
        )
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


# CSV REPORT BY ID




@app.get(
    "/report/csv/id/{upload_id}"
)
def download_csv_report(
    upload_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    upload, file_path = (
        resolve_user_upload_by_id(
            db,
            current_user,
            upload_id,
        )
    )

    logs = parse_upload(file_path)

    if not logs:
        raise HTTPException(
            status_code=400,
            detail=(
                "No valid log entries "
                "found in file"
            ),
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

    return FileResponse(
        path=str(report_path),
        media_type="text/csv",
        filename=(
            f"{Path(upload.original_filename).stem}"
            "_report.csv"
        ),
    )


# =========================================================
# PDF REPORT BY ID
# =========================================================


@app.get(
    "/report/pdf/id/{upload_id}"
)
def download_pdf_report(
    upload_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    upload, file_path = (
        resolve_user_upload_by_id(
            db,
            current_user,
            upload_id,
        )
    )

    logs = parse_upload(file_path)

    if not logs:
        raise HTTPException(
            status_code=400,
            detail=(
                "No valid log entries "
                "found in file"
            ),
        )

    analysis = build_analysis(
        db=db,
        upload=upload,
        user_id=current_user.id,
    )

    statistics = analysis.statistics
    anomalies = analysis.anomalies
    ai_summary = analysis.ai_summary

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

    if report_path.is_file():
        return FileResponse(
            path=str(report_path),
            media_type="application/pdf",
            filename=(
                f"{Path(upload.original_filename).stem}"
                "_report.pdf"
            ),
        )

    try:
        generate_pdf_report(
            report_path=str(report_path),
            filename=(
                upload.original_filename
            ),
            logs=logs,
            statistics=statistics,
            anomalies=anomalies,
            ai_summary=ai_summary,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "PDF generation failed: "
                f"{str(error)}"
            ),
        ) from error

    return FileResponse(
        path=str(report_path),
        media_type="application/pdf",
        filename=(
            f"{Path(upload.original_filename).stem}"
            "_report.pdf"
        ),
    )