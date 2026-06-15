"""seed categories

Revision ID: b2c3d4e5f6a7
Revises: 26015dd9a702
Create Date: 2026-06-15

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = '26015dd9a702'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CATEGORIES = [
    "Roads & Infrastructure",
    "Water Supply",
    "Electricity",
    "Sanitation & Waste",
    "Public Safety",
    "Education",
    "Healthcare",
    "Environment",
    "Public Transport",
    "Other",
]

def upgrade() -> None:
    categories_table = sa.table(
        "categories",
        sa.column("name", sa.String),
    )
    op.bulk_insert(categories_table, [{"name": name} for name in CATEGORIES])

def downgrade() -> None:
    op.execute("DELETE FROM categories WHERE name IN ({})".format(
        ", ".join(f"'{n}'" for n in CATEGORIES)
    ))
