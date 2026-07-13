from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.ai_summary import generate_ai_summary
from backend.analyzer import analyze_logs
from backend.anomaly_detector import detect_anomalies
from backend.models.analysis_model import AnalysisResult
from backend.models.upload_model import Upload
from backend.parser import parse_log_file
from backend.services.upload_service import get_upload_path


def get_cached_analysis(
    db: Session,
    upload_id: int,
    user_id: int,
):
    return (
        db.query(AnalysisResult)
        .filter(
            AnalysisResult.upload_id == upload_id,
            AnalysisResult.user_id == user_id,
        )
        .first()
    )


def build_analysis(
    db: Session,
    upload: Upload,
    user_id: int,
):
    cached_analysis = get_cached_analysis(
        db=db,
        upload_id=upload.id,
        user_id=user_id,
    )

    if cached_analysis:
        return cached_analysis

    file_path = get_upload_path(upload)

    try:
        logs = parse_log_file(str(file_path))
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse log file: {str(error)}",
        )

    if not logs:
        raise HTTPException(
            status_code=400,
            detail="No valid log entries found in file",
        )

    statistics = analyze_logs(logs)
    anomalies = detect_anomalies(logs)

    try:
        ai_summary = generate_ai_summary(
            logs,
            statistics,
            anomalies,
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}",
        )

    analysis = AnalysisResult(
        upload_id=upload.id,
        user_id=user_id,
        statistics=statistics,
        anomalies=anomalies,
        ai_summary=ai_summary,
    )

    try:
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

    except Exception:
        db.rollback()

        cached_analysis = get_cached_analysis(
            db=db,
            upload_id=upload.id,
            user_id=user_id,
        )

        if cached_analysis:
            return cached_analysis

        raise

    return analysis