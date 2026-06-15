from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.modules.problems.models import Problem, ProblemStatus
from app.modules.votes.models import Vote
from app.modules.comments.models import Comment
from datetime import datetime, timezone

class TrendingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_trending(self, limit: int = 10) -> list[dict]:
        vote_counts = select(
            Vote.problem_id,
            func.count(Vote.id).label("vote_count")
        ).group_by(Vote.problem_id).subquery()

        comment_counts = select(
            Comment.problem_id,
            func.count(Comment.id).label("comment_count")
        ).group_by(Comment.problem_id).subquery()

        result = await self.db.execute(
            select(Problem)
            .where(Problem.status != ProblemStatus.ARCHIVED)
            .order_by(Problem.created_at.desc())
        )
        problems = result.scalars().all()

        scored = []
        now = datetime.now(timezone.utc)
        for problem in problems:
            vote_result = await self.db.execute(
                select(func.count(Vote.id)).where(Vote.problem_id == problem.id)
            )
            vote_count = vote_result.scalar_one()

            comment_result = await self.db.execute(
                select(func.count(Comment.id)).where(Comment.problem_id == problem.id)
            )
            comment_count = comment_result.scalar_one()

            created_at = problem.created_at
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            age_hours = (now - created_at).total_seconds() / 3600
            recency = max(0, 100 - age_hours)

            score = (vote_count * 10) + (comment_count * 2) + recency
            scored.append({"problem": problem, "score": score})

        scored.sort(key=lambda x: x["score"], reverse=True)
        return [item["problem"] for item in scored[:limit]]
