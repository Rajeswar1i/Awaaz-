from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.modules.problems.models import Problem, ProblemImage
from app.modules.votes.models import Vote
from app.modules.comments.models import Comment

class ProblemRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, problem: Problem) -> Problem:
        self.db.add(problem)
        await self.db.commit()
        await self.db.refresh(problem)
        return problem

    async def get_by_id(self, problem_id: str) -> Problem | None:
        result = await self.db.execute(select(Problem).where(Problem.id == problem_id))
        return result.scalar_one_or_none()

    async def get_all(self, category_id: int | None, district: str | None, search: str | None, skip: int, limit: int) -> list[Problem]:
        query = select(Problem)
        if category_id:
            query = query.where(Problem.category_id == category_id)
        if district:
            query = query.where(Problem.district == district)
        if search:
            query = query.where(Problem.title.ilike(f"%{search}%"))
        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update(self, problem: Problem) -> Problem:
        await self.db.commit()
        await self.db.refresh(problem)
        return problem

    async def delete(self, problem: Problem) -> None:
        await self.db.execute(delete(Vote).where(Vote.problem_id == problem.id))
        await self.db.execute(delete(Comment).where(Comment.problem_id == problem.id))
        await self.db.execute(delete(ProblemImage).where(ProblemImage.problem_id == problem.id))
        await self.db.delete(problem)
        await self.db.commit()

    async def add_image(self, problem_id: str, image_url: str) -> ProblemImage:
        image = ProblemImage(problem_id=problem_id, image_url=image_url)
        self.db.add(image)
        await self.db.commit()
        await self.db.refresh(image)
        return image

    async def get_images(self, problem_id: str) -> list[ProblemImage]:
        result = await self.db.execute(select(ProblemImage).where(ProblemImage.problem_id == problem_id))
        return list(result.scalars().all())
