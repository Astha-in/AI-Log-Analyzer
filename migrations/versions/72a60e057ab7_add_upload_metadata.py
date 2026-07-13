"""add upload metadata

Revision ID: 72a60e057ab7
Revises:
Create Date: 2026-07-13 12:11:52.226152
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "72a60e057ab7"

down_revision: Union[
    str,
    Sequence[str],
    None,
] = None

branch_labels: Union[
    str,
    Sequence[str],
    None,
] = None

depends_on: Union[
    str,
    Sequence[str],
    None,
] = None


def upgrade() -> None:
    op.add_column(
        "uploads",
        sa.Column(
            "file_size",
            sa.BigInteger(),
            nullable=False,
            server_default="0",
        ),
    )

    op.add_column(
        "uploads",
        sa.Column(
            "total_logs",
            sa.Integer(),
            nullable=False,
            server_default="0",
        ),
    )

    op.add_column(
        "uploads",
        sa.Column(
            "status",
            sa.String(length=30),
            nullable=False,
            server_default="uploaded",
        ),
    )

    op.create_index(
        "ix_uploads_created_at",
        "uploads",
        ["created_at"],
        unique=False,
    )

    op.create_index(
        "ix_uploads_status",
        "uploads",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_uploads_status",
        table_name="uploads",
    )

    op.drop_index(
        "ix_uploads_created_at",
        table_name="uploads",
    )

    op.drop_column(
        "uploads",
        "status",
    )

    op.drop_column(
        "uploads",
        "total_logs",
    )

    op.drop_column(
        "uploads",
        "file_size",
    )