from sqlalchemy import (
    BigInteger,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.sql import func

from backend.database import Base


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    original_filename = Column(
        String(255),
        nullable=False,
    )

    stored_filename = Column(
        String(255),
        unique=True,
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

    file_size = Column(
        BigInteger,
        nullable=False,
        default=0,
    )

    total_logs = Column(
        Integer,
        nullable=False,
        default=0,
    )

    status = Column(
        String(30),
        nullable=False,
        default="uploaded",
        index=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )