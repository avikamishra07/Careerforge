"""
app/services/history_service.py — Persistent history (MongoDB or in-memory)
"""
import logging
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId

from app.core.database import get_db
from app.schemas.models import (
    InterviewFeedback, ResumeAnalysis,
    InterviewHistoryItem, ResumeHistoryItem, HistorySummary,
    SaveInterviewRequest,
)

logger = logging.getLogger(__name__)

# In-memory fallback
_mem_interviews: list = []
_mem_resumes: list = []


def _now() -> datetime:
    return datetime.now(timezone.utc)


async def save_interview(user_id: str, request: SaveInterviewRequest) -> str:
    db = get_db()
    doc = {
        "user_id": user_id,
        "role": request.role,
        "level": request.level,
        "overall_score": request.feedback.overall_score,
        "communication_score": request.feedback.communication_score,
        "technical_score": request.feedback.technical_score,
        "confidence_score": request.feedback.confidence_score,
        "strengths": request.feedback.strengths,
        "weaknesses": request.feedback.weaknesses,
        "improvements": request.feedback.improvements,
        "communication_feedback": request.feedback.communication_feedback,
        "technical_feedback": request.feedback.technical_feedback,
        "summary": request.feedback.summary,
        "duration_seconds": request.duration_seconds,
        "qa_pairs": [qa.model_dump() for qa in (request.qa_pairs or [])],
        "created_at": _now(),
    }

    if db is not None:
        result = await db.interviews.insert_one(doc)
        return str(result.inserted_id)
    else:
        doc["_id"] = f"mem_{len(_mem_interviews)}"
        _mem_interviews.append(doc)
        return doc["_id"]


async def save_resume(user_id: str, analysis: ResumeAnalysis, filename: Optional[str] = None) -> str:
    db = get_db()
    doc = {
        "user_id": user_id,
        "filename": filename,
        "ats_score": analysis.ats_score,
        "strengths": analysis.strengths,
        "missing_skills": analysis.missing_skills,
        "improvements": analysis.improvements,
        "suitable_roles": analysis.suitable_roles,
        "skills_found": analysis.skills_found,
        "summary": analysis.summary,
        "ats_breakdown": analysis.ats_breakdown.model_dump(),
        "created_at": _now(),
    }

    if db is not None:
        result = await db.resumes.insert_one(doc)
        return str(result.inserted_id)
    else:
        doc["_id"] = f"mem_{len(_mem_resumes)}"
        _mem_resumes.append(doc)
        return doc["_id"]


async def get_user_history(user_id: str) -> HistorySummary:
    db = get_db()

    if db is not None:
        interview_docs = await db.interviews.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20).to_list(20)

        resume_docs = await db.resumes.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(20).to_list(20)
    else:
        interview_docs = [d for d in _mem_interviews if d.get("user_id") == user_id]
        resume_docs = [d for d in _mem_resumes if d.get("user_id") == user_id]

    interviews = [
        InterviewHistoryItem(
            id=str(d.get("_id", "")),
            role=d["role"],
            level=d.get("level", "mid"),
            overall_score=d["overall_score"],
            communication_score=d["communication_score"],
            technical_score=d["technical_score"],
            confidence_score=d.get("confidence_score", 70),
            summary=d.get("summary", ""),
            duration_seconds=d.get("duration_seconds"),
            created_at=d["created_at"],
        )
        for d in interview_docs
    ]

    resumes = [
        ResumeHistoryItem(
            id=str(d.get("_id", "")),
            filename=d.get("filename"),
            ats_score=d["ats_score"],
            summary=d.get("summary", ""),
            skills_found=d.get("skills_found", []),
            suitable_roles=d.get("suitable_roles", []),
            created_at=d["created_at"],
        )
        for d in resume_docs
    ]

    best_interview = max((i.overall_score for i in interviews), default=None)
    best_ats = max((r.ats_score for r in resumes), default=None)

    return HistorySummary(
        interviews=interviews,
        resumes=resumes,
        total_interviews=len(interviews),
        total_resumes=len(resumes),
        best_interview_score=best_interview,
        best_ats_score=best_ats,
    )
