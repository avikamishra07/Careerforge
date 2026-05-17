from fastapi import APIRouter
from app.core.database import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health():
    db = get_db()
    ai_providers = []
    if settings.GROQ_API_KEY:
        ai_providers.append("groq")
    if settings.GEMINI_API_KEY:
        ai_providers.append("gemini")
    if settings.ANTHROPIC_API_KEY:
        ai_providers.append("anthropic")

    return {
        "status": "ok",
        "version": "1.0.0",
        "database": "connected" if db is not None else "in-memory (no persistence)",
        "ai_providers": ai_providers or ["none configured — fallbacks active"],
        "environment": settings.ENVIRONMENT,
    }
