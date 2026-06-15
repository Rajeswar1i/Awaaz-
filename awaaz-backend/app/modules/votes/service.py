from app.modules.votes.repository import VoteRepository
from app.modules.votes.models import Vote
from app.core.exceptions import ConflictException, NotFoundException

class VoteService:
    def __init__(self, repository: VoteRepository):
        self.repository = repository

    async def add_vote(self, user_id: str, problem_id: str) -> dict:
        existing = await self.repository.get_vote(user_id, problem_id)
        if existing:
            raise ConflictException("You have already voted on this problem")
        vote = Vote(user_id=user_id, problem_id=problem_id)
        await self.repository.create(vote)
        count = await self.repository.count(problem_id)
        return {"message": "Vote added", "vote_count": count}

    async def remove_vote(self, user_id: str, problem_id: str) -> dict:
        vote = await self.repository.get_vote(user_id, problem_id)
        if not vote:
            raise NotFoundException("You have not voted on this problem")
        await self.repository.delete(vote)
        count = await self.repository.count(problem_id)
        return {"message": "Vote removed", "vote_count": count}
