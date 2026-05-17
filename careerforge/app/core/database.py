"""
app/core/database.py — Async MongoDB with Motor
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db():
    global _client, _db
    try:
        _client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        _db = _client[settings.MONGODB_DB_NAME]
        # Verify connection
        await _client.admin.command("ping")
        logger.info(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        await _ensure_indexes()
    except Exception as e:
        logger.warning(f"MongoDB connection failed: {e} — running in degraded mode (no persistence)")
        _client = None
        _db = None


async def disconnect_db():
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB disconnected")


def get_db() -> AsyncIOMotorDatabase | None:
    return _db


async def _ensure_indexes():
    """Create indexes for performance."""
    if _db is None:
        return
    try:
        await _db.users.create_index("email", unique=True)
        await _db.interviews.create_index("user_id")
        await _db.interviews.create_index("created_at")
        await _db.resumes.create_index("user_id")
        await _db.skillswap.create_index([("offer", "text"), ("want", "text")])
        await _db.team_profiles.create_index("user_id")
        logger.info("Database indexes created")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")
