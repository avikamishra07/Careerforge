"""
app/api/v1/routes/resume.py — Resume analyzer endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from app.schemas.models import ResumeAnalysis, MessageResponse
from app.services import resume_service, history_service
from app.core.auth import get_current_user, get_optional_user
from app.core.config import settings

router = APIRouter()

MAX_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@router.post("/analyze/text", response_model=ResumeAnalysis)
async def analyze_resume_text(
    text: str = Form(..., min_length=50),
    _: dict = Depends(get_optional_user),
):
    """Analyze resume from pasted text."""
    if len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text too short")
    try:
        return await resume_service.analyze_resume(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze/pdf", response_model=ResumeAnalysis)
async def analyze_resume_pdf(
    file: UploadFile = File(...),
    _: dict = Depends(get_optional_user),
):
    """Analyze resume from uploaded PDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    contents = await file.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    # Extract text from PDF
    text = await resume_service.extract_text_from_pdf(contents)

    if not text or len(text.strip()) < 30:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from PDF. Try pasting your resume text instead.",
        )

    try:
        return await resume_service.analyze_resume(text, filename=file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/save", response_model=MessageResponse)
async def save_resume_result(
    analysis: ResumeAnalysis,
    filename: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
):
    """Save resume analysis to history (requires auth)."""
    try:
        record_id = await history_service.save_resume(
            user_id=current_user["sub"],
            analysis=analysis,
            filename=filename,
        )
        return MessageResponse(message=f"Resume analysis saved (id: {record_id})")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
