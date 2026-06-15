from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.modules.categories.schemas import CategoryResponse
from app.modules.categories.service import CategoryService
from app.modules.categories.repository import CategoryRepository

router = APIRouter(prefix="/api/v1/categories", tags=["categories"])

def get_category_service(db: AsyncSession = Depends(get_db)) -> CategoryService:
    return CategoryService(CategoryRepository(db))

@router.get("/", response_model=list[CategoryResponse])
async def get_categories(service: CategoryService = Depends(get_category_service)):
    return await service.get_all()
