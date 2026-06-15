from fastapi import APIRouter, Depends
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import func, select as sa_select

class ImageUrlRequest(BaseModel):
    image_url: str
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.users.models import User
from app.modules.problems.models import Problem
from app.modules.problems.schemas import ProblemCreate, ProblemUpdate, ProblemResponse
from app.modules.problems.service import ProblemService
from app.modules.problems.repository import ProblemRepository
from app.modules.problems.trending import TrendingService


router = APIRouter(prefix="/api/v1/problems", tags=["problems"])

def get_problem_service(db: AsyncSession = Depends(get_db)) -> ProblemService:
    return ProblemService(ProblemRepository(db))

@router.post("/", response_model=ProblemResponse)
async def create_problem(
    data: ProblemCreate,
    service: ProblemService = Depends(get_problem_service),
    current_user: User = Depends(get_current_user)
):
    return await service.create_problem(data, current_user.id)

@router.get("/", response_model=list[ProblemResponse])
async def get_problems(
    category_id: Optional[int] = None,
    district: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    service: ProblemService = Depends(get_problem_service)
):
    return await service.get_all_problems(category_id, district, search, skip, limit)

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        sa_select(
            func.count().label("total"),
            func.count().filter(Problem.status == "OPEN").label("open"),
            func.count().filter(Problem.status == "TRENDING").label("trending"),
            func.count().filter(Problem.status == "IN_PROGRESS").label("in_progress"),
            func.count().filter(Problem.status == "ARCHIVED").label("archived"),
        ).select_from(Problem)
    )
    row = result.one()
    return {
        "total": row.total,
        "open": row.open,
        "trending": row.trending,
        "in_progress": row.in_progress,
        "archived": row.archived,
    }

@router.get("/trending", response_model=list[ProblemResponse])
async def get_trending(
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    service = TrendingService(db)
    return await service.get_trending(limit)

@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(
    problem_id: str,
    service: ProblemService = Depends(get_problem_service)
):
    return await service.get_problem(problem_id)

@router.patch("/{problem_id}", response_model=ProblemResponse)
async def update_problem(
    problem_id: str,
    data: ProblemUpdate,
    service: ProblemService = Depends(get_problem_service),
    current_user: User = Depends(get_current_user)
):
    return await service.update_problem(problem_id, data, current_user.id)

@router.delete("/{problem_id}")
async def delete_problem(
    problem_id: str,
    service: ProblemService = Depends(get_problem_service),
    current_user: User = Depends(get_current_user)
):
    await service.delete_problem(problem_id, current_user.id)
    return {"message": "Problem deleted"}

@router.post("/{problem_id}/images")
async def add_image(
    problem_id: str,
    data: ImageUrlRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    repo = ProblemRepository(db)
    image = await repo.add_image(problem_id, data.image_url)
    return {"id": image.id, "image_url": image.image_url}

@router.get("/{problem_id}/images")
async def get_images(
    problem_id: str,
    db: AsyncSession = Depends(get_db)
):
    repo = ProblemRepository(db)
    images = await repo.get_images(problem_id)
    return [{"id": img.id, "image_url": img.image_url} for img in images]

