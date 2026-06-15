"""add in_progress status

Revision ID: a1b2c3d4e5f6
Revises: 74f1f4312536
Create Date: 2026-06-15 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '74f1f4312536'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE problemstatus ADD VALUE IF NOT EXISTS 'IN_PROGRESS'")


def downgrade() -> None:
    pass
