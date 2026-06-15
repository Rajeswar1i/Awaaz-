import uuid
from datetime import datetime
from sqlalchemy import String, Text, Float, Boolean, DateTime, ForeignKey, Enum, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import enum

class ProblemStatus(enum.Enum):
    OPEN = "OPEN"
    TRENDING = "TRENDING"
    IN_PROGRESS = "IN_PROGRESS"
    ARCHIVED = "ARCHIVED"

class Problem(Base):
    __tablename__ = "problems"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    address: Mapped[str] = mapped_column(String, nullable=True)
    district: Mapped[str] = mapped_column(String, nullable=True)
    state: Mapped[str] = mapped_column(String, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    is_anonymous: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[ProblemStatus] = mapped_column(Enum(ProblemStatus), default=ProblemStatus.OPEN)
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_problems_status", "status"),
        Index("ix_problems_category_id", "category_id"),
        Index("ix_problems_created_at", "created_at"),
        Index("ix_problems_created_by", "created_by"),
    )

class ProblemImage(Base):
    __tablename__ = "problem_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    problem_id: Mapped[str] = mapped_column(ForeignKey("problems.id"), nullable=False)
    image_url: Mapped[str] = mapped_column(String, nullable=False)
