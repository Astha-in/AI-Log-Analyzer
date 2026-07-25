import json

from fastapi import (
    APIRouter,
    Depends,
)
from sqlalchemy.orm import Session

from backend.core.logger import logger
from backend.core.redis_client import redis_client
from backend.database import get_db
from backend.models.user_model import User
from backend.routes.auth_routes import get_current_user
from backend.services.analysis_service import build_analysis
from backend.utils.route_helpers import resolve_user_upload_by_id

router = APIRouter()


# =========================================================
# AI SUMMARY BY UPLOAD ID
# =========================================================

@router.get("/ai-summary/id/{upload_id}")
def get_ai_summary(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    logger.info(
        f"AI summary requested "
        f"(User: {current_user.id}, Upload: {upload_id})"
    )

    cache_key = f"ai_summary:{current_user.id}:{upload_id}"

    try:
        # Check Redis cache
        cached_summary = redis_client.get(cache_key)

        if cached_summary:
            logger.info(
                f"AI summary served from Redis cache "
                f"(Upload: {upload_id})"
            )

            return json.loads(cached_summary)

        # Get upload
        upload, _ = resolve_user_upload_by_id(
            db,
            current_user,
            upload_id,
        )

        # Generate AI analysis
        analysis = build_analysis(
            db=db,
            upload=upload,
            user_id=current_user.id,
        )

        response = {
            "filename": upload.original_filename,
            "upload_id": upload.id,
            "ai_summary": analysis.ai_summary,
        }

        # Cache response for 24 hours
        redis_client.setex(
            cache_key,
            86400,
            json.dumps(response),
        )

        logger.info(
            f"AI summary generated and cached "
            f"(Upload: {upload.id})"
        )

        return response

    except Exception:
        logger.exception(
            f"Failed to generate AI summary "
            f"(User: {current_user.id}, Upload: {upload_id})"
        )
        raise