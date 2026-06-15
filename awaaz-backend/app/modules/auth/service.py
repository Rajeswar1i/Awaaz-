from app.modules.users.repository import UserRepository
from app.modules.auth.schemas import LoginRequest, TokenResponse
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.exceptions import UnauthorizedException

class AuthService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.repository.get_by_email(data.email)
        if not user:
            raise UnauthorizedException("Invalid email or password")
        if not verify_password(data.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password")
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
