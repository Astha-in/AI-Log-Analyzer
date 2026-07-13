from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from backend.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    upload_id = Column(
        Integer,
        ForeignKey(
            "uploads.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    statistics = Column(
        JSON,
        nullable=False,
    )

    anomalies = Column(
        JSON,
        nullable=False,
    )

    ai_summary = Column(
        JSON,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "upload_id",
            "user_id",
            name="uq_analysis_upload_user",
        ),
    )