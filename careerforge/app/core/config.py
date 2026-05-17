"""
app/core/config.py — Environment configuration
All secrets come from .env — never hardcoded.
"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # ── App ──
    APP_NAME: str = "CareerForge AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ── Database (MongoDB) ──
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "careerforge"

    # ── AI Providers (use whichever key you have) ──
    GROQ_API_KEY: str = ""          # Recommended for hackathon — free tier
    GEMINI_API_KEY: str = ""        # Fallback option
    ANTHROPIC_API_KEY: str = ""     # For Claude (already in frontend)
    OPENAI_API_KEY: str = ""        # Optional fallback

    # ── AI Model Config ──
    GROQ_MODEL: str = "llama-3.3-70b-versatile"  # Fast, free, capable
    GEMINI_MODEL: str = "gemini-1.5-flash"
    AI_PROVIDER: str = "groq"       # "groq" | "gemini" | "anthropic"
    AI_TIMEOUT: int = 30            # seconds

    # ── Auth ──
    JWT_SECRET: str = "change-me-in-production-please"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # ── CORS ──
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://careerforge.vercel.app",
        "*",  # Open for hackathon — tighten for production
    ]

    # ── File Upload ──
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
