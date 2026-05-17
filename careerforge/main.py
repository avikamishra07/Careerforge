"""
CareerForge AI — FastAPI Backend
Hackathon MVP | Python 3.11+
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import connect_db, disconnect_db
from app.api.v1.routes import interview, resume, team, skillswap, users, health

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CareerForge AI backend...")
    await connect_db()
    yield
    await disconnect_db()
    logger.info("Backend shutdown complete.")


app = FastAPI(
    title="CareerForge AI API",
    description="AI-powered career platform backend — mock interviews, resume analysis, team matching, SkillSwap",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(interview.router, prefix="/api/v1/interview", tags=["Interview"])
app.include_router(resume.router, prefix="/api/v1/resume", tags=["Resume"])
app.include_router(team.router, prefix="/api/v1/team", tags=["Team Matching"])
app.include_router(skillswap.router, prefix="/api/v1/skillswap", tags=["SkillSwap"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
