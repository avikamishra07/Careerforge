"""
app/api/v1/routes/interview.py — Mock interview endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.models import (
    GenerateQuestionsRequest, GenerateQuestionsResponse,
    EvaluateInterviewRequest, InterviewFeedback,
    SaveInterviewRequest, MessageResponse,
    InterviewHistoryItem, HistorySummary,
)
from app.services import interview_service, history_service
from app.core.auth import get_current_user, get_optional_user

router = APIRouter()


@router.post("/questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
    _: dict = Depends(get_optional_user),  # optional auth
):
    """
    Generate AI interview questions for a given role and level.
    Works without auth for demo purposes.
    """
    try:
        questions = await interview_service.generate_questions(
            role=request.role,
            level=request.level,
            count=request.count,
        )
        return GenerateQuestionsResponse(
            questions=questions,
            role=request.role,
            level=request.level,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Question generation failed: {str(e)}")


@router.post("/evaluate", response_model=InterviewFeedback)
async def evaluate_interview(
    request: EvaluateInterviewRequest,
    _: dict = Depends(get_optional_user),
):
    """
    Evaluate interview answers and return structured feedback.
    The heavy-lifting endpoint — calls AI provider.
    """
    if not request.qa_pairs:
        raise HTTPException(status_code=400, detail="No answers provided")

    try:
        feedback = await interview_service.evaluate_interview(
            role=request.role,
            level=request.level,
            qa_pairs=request.qa_pairs,
            duration_seconds=request.duration_seconds or 0,
        )
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@router.post("/save", response_model=MessageResponse)
async def save_interview(
    request: SaveInterviewRequest,
    current_user: dict = Depends(get_current_user),
):
    """Save a completed interview to history (requires auth)."""
    try:
        record_id = await history_service.save_interview(
            user_id=current_user["sub"],
            request=request,
        )
        return MessageResponse(message=f"Interview saved (id: {record_id})")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history", response_model=HistorySummary)
async def get_history(current_user: dict = Depends(get_current_user)):
    """Get the user's full interview and resume history."""
    try:
        return await history_service.get_user_history(current_user["sub"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
