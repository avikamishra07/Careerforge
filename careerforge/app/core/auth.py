"""
app/core/auth.py — JWT authentication helpers (argon2 version)
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from argon2 import PasswordHasher
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings


# ✅ Replaced bcrypt with argon2 (fixes 72-byte issue)
ph = PasswordHasher()

bearer_scheme = HTTPBearer(auto_error=False)


# -----------------------------
# PASSWORD HASHING
# -----------------------------

def hash_password(password: str) -> str:
    """
    Hash password using Argon2 (secure, no 72-byte limit)
    """
    return ph.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify password using Argon2
    """
    try:
        return ph.verify(hashed, plain)
    except Exception:
        return False


# -----------------------------
# JWT TOKEN
# -----------------------------

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


# -----------------------------
# AUTH DEPENDENCIES
# -----------------------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Extract user from JWT (required auth)
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    return decode_token(credentials.credentials)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Optional[dict]:
    """
    Extract user from JWT (optional auth)
    """
    if not credentials:
        return None

    try:
        return decode_token(credentials.credentials)
    except Exception:
        return None