from app.modules.comments.repository import CommentRepository
from app.modules.comments.models import Comment
from app.modules.comments.schemas import CommentCreate

class CommentService:
    def __init__(self, repository: CommentRepository):
        self.repository = repository

    async def add_comment(self, data: CommentCreate, user_id: str, problem_id: str) -> Comment:
        comment = Comment(
            user_id=user_id,
            problem_id=problem_id,
            message=data.message
        )
        return await self.repository.create(comment)

    async def get_comments(self, problem_id: str, skip: int, limit: int) -> list[Comment]:
        return await self.repository.get_by_problem(problem_id, skip, limit)
