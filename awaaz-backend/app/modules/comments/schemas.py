from pydantic import BaseModel
from datetime import datetime

class CommentCreate(BaseModel):
    message: str

class CommentResponse(BaseModel):
    id: str
    user_id: str
    problem_id: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}
