from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.users.models import User
from app.modules.votes.schemas import VoteResponse
from app.modules.votes.service import VoteService
from app.modules.votes.repository import VoteRepository

router = APIRouter(prefix="/api/v1/problems", tags=["votes"])

def get_vote_service(db: AsyncSession = Depends(get_db)) -> VoteService:
    return VoteService(VoteRepository(db))

@router.post("/{problem_id}/vote", response_model=VoteResponse)
async def add_vote(
    problem_id: str,
    service: VoteService = Depends(get_vote_service),
    current_user: User = Depends(get_current_user)
):
    return await service.add_vote(current_user.id, problem_id)

@router.delete("/{problem_id}/vote", response_model=VoteResponse)
async def remove_vote(
    problem_id: str,
    service: VoteService = Depends(get_vote_service),
    current_user: User = Depends(get_current_user)
):
    return await service.remove_vote(current_user.id, problem_id)
