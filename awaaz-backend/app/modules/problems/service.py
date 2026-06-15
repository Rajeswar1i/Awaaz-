from app.modules.problems.repository import ProblemRepository
from app.modules.problems.models import Problem
from app.modules.problems.schemas import ProblemCreate, ProblemUpdate
from app.core.exceptions import NotFoundException, ForbiddenException

class ProblemService:
    def __init__(self, repository: ProblemRepository):
        self.repository = repository

    async def create_problem(self, data: ProblemCreate, user_id: str) -> Problem:
        problem = Problem(
            title=data.title,
            description=data.description,
            category_id=data.category_id,
            address=data.address,
            district=data.district,
            state=data.state,
            latitude=data.latitude,
            longitude=data.longitude,
            is_anonymous=data.is_anonymous,
            created_by=user_id
        )
        return await self.repository.create(problem)

    async def get_problem(self, problem_id: str) -> Problem:
        problem = await self.repository.get_by_id(problem_id)
        if not problem:
            raise NotFoundException("Problem not found")
        return problem

    async def get_all_problems(self, category_id: int | None, district: str | None, search: str | None, skip: int, limit: int) -> list[Problem]:
        return await self.repository.get_all(category_id, district, search, skip, limit)

    async def update_problem(self, problem_id: str, data: ProblemUpdate, user_id: str) -> Problem:
        problem = await self.get_problem(problem_id)
        if problem.created_by != user_id:
            raise ForbiddenException("You can only edit your own problems")
        if data.title:
            problem.title = data.title
        if data.description:
            problem.description = data.description
        if data.status:
            problem.status = data.status
        return await self.repository.update(problem)

    async def delete_problem(self, problem_id: str, user_id: str) -> None:
        problem = await self.get_problem(problem_id)
        if problem.created_by != user_id:
            raise ForbiddenException("You can only delete your own problems")
        await self.repository.delete(problem)
