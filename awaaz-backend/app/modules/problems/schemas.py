from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.modules.problems.models import ProblemStatus

class ProblemCreate(BaseModel):
    title: str
    description: str
    category_id: int
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_anonymous: bool = False

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProblemStatus] = None

class ProblemResponse(BaseModel):
    id: str
    title: str
    description: str
    category_id: int
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_anonymous: bool
    status: ProblemStatus
    created_by: str
    created_at: datetime

    model_config = {"from_attributes": True}
