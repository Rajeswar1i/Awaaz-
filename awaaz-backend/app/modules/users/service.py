from app.modules.users.repository import UserRepository
from app.modules.users.models import User
from app.modules.users.schemas import UserCreate
from app.core.security import hash_password
from app.core.exceptions import ConflictException, NotFoundException

class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.repository.get_by_email(data.email)
        if existing:
            raise ConflictException("Email already registered")
        user = User(
            name=data.name,
            email=data.email,
            password_hash=hash_password(data.password)
        )
        return await self.repository.create(user)

    async def get_user_by_id(self, user_id: str) -> User:
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return user
