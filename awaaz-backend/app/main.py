import os
from fastapi import FastAPI, UploadFile, File
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.modules.auth.router import router as auth_router
from app.modules.categories.router import router as categories_router
from app.modules.problems.router import router as problems_router
from app.modules.votes.router import router as votes_router
from app.modules.comments.router import router as comments_router

app = FastAPI(
    title="Awaaz API",
    version="1.0.0",
    swagger_ui_parameters={"persistAuthorization": True}
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(problems_router)
app.include_router(votes_router)
app.include_router(comments_router)

@app.get("/")
async def root():
    return {"message": "Awaaz API is running"}

@app.post("/api/v1/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1]
    filename = f"{os.urandom(8).hex()}.{ext}"
    path = f"uploads/{filename}"
    with open(path, "wb") as f:
        content = await file.read()
        f.write(content)
    return {"url": f"http://localhost:8000/uploads/{filename}"}

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(title="Awaaz API", version="1.0.0", routes=app.routes)
    schema.setdefault("components", {})
    schema["components"]["securitySchemes"] = {
        "HTTPBearer": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
    }
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi
