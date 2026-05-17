"""
app/api/v1/routes/team.py — Team matching endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.models import TeamProfileRequest, TeamMatchResponse
from app.services import team_service
from app.core.auth import get_optional_user

router = APIRouter()


@router.post("/match", response_model=TeamMatchResponse)
async def find_teammates(
    profile: TeamProfileRequest,
    use_ai: bool = False,
    _: dict = Depends(get_optional_user),
):
    """
    Find compatible teammates.
    use_ai=True: AI-generated profiles (costs API tokens)
    use_ai=False: Fast local cosine similarity (default)
    """
    try:
        if use_ai:
            matches = await team_service.generate_ai_matches(profile)
        else:
            matches = await team_service.find_matches(profile)

        return TeamMatchResponse(matches=matches, total=len(matches))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")
