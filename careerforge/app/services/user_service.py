"""
app/services/user_service.py — User management with MongoDB
Falls back to in-memory store if MongoDB is unavailable.
"""
import logging
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId

from app.core.database import get_db
from app.core.auth import hash_password, verify_password, create_access_token
from app.schemas.models import UserRegister, UserLogin, UserProfile, UserProfileUpdate, AuthResponse

logger = logging.getLogger(__name__)

# In-memory fallback (resets on restart — fine for demo)
_mem_users: dict = {}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _to_profile(doc: dict) -> UserProfile:
    return UserProfile(
        name=doc.get("name", ""),
        email=doc.get("email", ""),
        role=doc.get("role"),
        bio=doc.get("bio"),
        github=doc.get("github"),
        linkedin=doc.get("linkedin"),
        skills=doc.get("skills", []),
    )


async def register_user(data: UserRegister) -> AuthResponse:
    db = get_db()

    if db is not None:
        # MongoDB path
        existing = await db.users.find_one({"email": data.email})
        if existing:
            raise ValueError("Email already registered")

        doc = {
            "name": data.name,
            "email": data.email,
            "password_hash": hash_password(data.password),
            "role": None,
            "bio": None,
            "github": None,
            "linkedin": None,
            "skills": [],
            "created_at": _now(),
        }
        result = await db.users.insert_one(doc)
        user_id = str(result.inserted_id)
    else:
        # In-memory fallback
        if data.email in _mem_users:
            raise ValueError("Email already registered")
        user_id = f"mem_{data.email}"
        _mem_users[data.email] = {
            "id": user_id,
            "name": data.name,
            "email": data.email,
            "password_hash": hash_password(data.password),
            "role": None, "bio": None, "github": None, "linkedin": None, "skills": [],
        }

    token = create_access_token({"sub": user_id, "email": data.email, "name": data.name})
    profile = UserProfile(name=data.name, email=data.email, skills=[])
    return AuthResponse(token=token, user=profile)


async def login_user(data: UserLogin) -> AuthResponse:
    db = get_db()

    if db is not None:
        doc = await db.users.find_one({"email": data.email})
        if not doc or not verify_password(data.password, doc["password_hash"]):
            raise ValueError("Invalid email or password")
        user_id = str(doc["_id"])
        profile = _to_profile(doc)
    else:
        doc = _mem_users.get(data.email)
        if not doc or not verify_password(data.password, doc["password_hash"]):
            raise ValueError("Invalid email or password")
        user_id = doc["id"]
        profile = _to_profile(doc)

    token = create_access_token({"sub": user_id, "email": data.email, "name": profile.name})
    return AuthResponse(token=token, user=profile)


async def get_user_profile(user_id: str, email: str) -> Optional[UserProfile]:
    db = get_db()
    if db is not None:
        try:
            doc = await db.users.find_one({"_id": ObjectId(user_id)})
            return _to_profile(doc) if doc else None
        except Exception:
            doc = await db.users.find_one({"email": email})
            return _to_profile(doc) if doc else None
    else:
        doc = _mem_users.get(email)
        return _to_profile(doc) if doc else None


async def update_user_profile(user_id: str, email: str, updates: UserProfileUpdate) -> UserProfile:
    db = get_db()
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}

    if db is not None:
        try:
            await db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {**update_data, "updated_at": _now()}},
            )
            doc = await db.users.find_one({"_id": ObjectId(user_id)})
            return _to_profile(doc)
        except Exception:
            await db.users.update_one(
                {"email": email},
                {"$set": {**update_data, "updated_at": _now()}},
            )
            doc = await db.users.find_one({"email": email})
            return _to_profile(doc)
    else:
        if email in _mem_users:
            _mem_users[email].update(update_data)
        return _to_profile(_mem_users.get(email, {"name": "", "email": email}))
