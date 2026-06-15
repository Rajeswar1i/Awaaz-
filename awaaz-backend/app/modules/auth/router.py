from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException
from app.modules.auth.schemas import LoginRequest, TokenResponse
from app.modules.auth.service import AuthService
from app.modules.users.schemas import UserCreate, UserResponse
from app.modules.users.service import UserService
from app.modules.users.repository import UserRepository

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db))

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    return UserService(UserRepository(db))

@router.post("/register", response_model=UserResponse)
async def register(data: UserCreate, service: UserService = Depends(get_user_service)):
    return await service.create_user(data)

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, service: AuthService = Depends(get_auth_service)):
    return await service.login(data)

@router.get("/me", response_model=UserResponse)
async def me(token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException()
    service = UserService(UserRepository(db))
    return await service.get_user_by_id(user_id)
