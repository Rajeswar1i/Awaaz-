from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.modules.votes.models import Vote

class VoteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_vote(self, user_id: str, problem_id: str) -> Vote | None:
        result = await self.db.execute(
            select(Vote).where(Vote.user_id == user_id, Vote.problem_id == problem_id)
        )
        return result.scalar_one_or_none()

    async def create(self, vote: Vote) -> Vote:
        self.db.add(vote)
        await self.db.commit()
        await self.db.refresh(vote)
        return vote

    async def delete(self, vote: Vote) -> None:
        await self.db.delete(vote)
        await self.db.commit()

    async def count(self, problem_id: str) -> int:
        result = await self.db.execute(
            select(func.count()).where(Vote.problem_id == problem_id)
        )
        return result.scalar_one()
