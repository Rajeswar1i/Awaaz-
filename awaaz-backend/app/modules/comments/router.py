from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.users.models import User
from app.modules.comments.schemas import CommentCreate, CommentResponse
from app.modules.comments.service import CommentService
from app.modules.comments.repository import CommentRepository

router = APIRouter(prefix="/api/v1/problems", tags=["comments"])

def get_comment_service(db: AsyncSession = Depends(get_db)) -> CommentService:
    return CommentService(CommentRepository(db))

@router.post("/{problem_id}/comments", response_model=CommentResponse)
async def add_comment(
    problem_id: str,
    data: CommentCreate,
    service: CommentService = Depends(get_comment_service),
    current_user: User = Depends(get_current_user)
):
    return await service.add_comment(data, current_user.id, problem_id)

@router.get("/{problem_id}/comments", response_model=list[CommentResponse])
async def get_comments(
    problem_id: str,
    skip: int = 0,
    limit: int = 10,
    service: CommentService = Depends(get_comment_service)
):
    return await service.get_comments(problem_id, skip, limit)
