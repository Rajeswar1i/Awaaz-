from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.modules.comments.models import Comment

class CommentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, comment: Comment) -> Comment:
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def get_by_problem(self, problem_id: str, skip: int, limit: int) -> list[Comment]:
        result = await self.db.execute(
            select(Comment)
            .where(Comment.problem_id == problem_id)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
