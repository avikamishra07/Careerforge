"""
app/api/v1/routes/users.py — Auth and profile endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.models import (
    UserRegister, UserLogin, UserProfileUpdate,
    AuthResponse, UserProfile, MessageResponse,
)
from app.services import user_service
from app.core.auth import get_current_user

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(data: UserRegister):
    """Create a new account."""
    try:
        return await user_service.register_user(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin):
    """Authenticate and receive JWT."""
    try:
        return await user_service.login_user(data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserProfile)
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    profile = await user_service.get_user_profile(
        current_user["sub"], current_user["email"]
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.patch("/me", response_model=UserProfile)
async def update_profile(
    updates: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update profile fields."""
    return await user_service.update_user_profile(
        current_user["sub"], current_user["email"], updates
    )
