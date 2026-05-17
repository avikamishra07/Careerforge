"""
app/schemas/models.py — All Pydantic request/response schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ── Shared ──
class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None


# ── Auth / Users ──
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    name: str
    email: str
    role: Optional[str] = None
    bio: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    skills: List[str] = []


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    skills: Optional[List[str]] = None


class AuthResponse(BaseModel):
    token: str
    user: UserProfile


# ── Interview ──
class ExperienceLevel(str, Enum):
    junior = "junior"
    mid = "mid"
    senior = "senior"


class GenerateQuestionsRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=100)
    level: ExperienceLevel = ExperienceLevel.mid
    count: int = Field(default=5, ge=3, le=8)


class GenerateQuestionsResponse(BaseModel):
    questions: List[str]
    role: str
    level: str


class QuestionAnswer(BaseModel):
    question: str
    answer: str


class EvaluateInterviewRequest(BaseModel):
    role: str
    level: ExperienceLevel = ExperienceLevel.mid
    qa_pairs: List[QuestionAnswer]
    duration_seconds: Optional[int] = None


class InterviewFeedback(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    communication_score: int = Field(..., ge=0, le=100)
    technical_score: int = Field(..., ge=0, le=100)
    confidence_score: int = Field(..., ge=0, le=100)
    strengths: List[str]
    weaknesses: List[str]
    improvements: List[str]
    communication_feedback: str
    technical_feedback: str
    summary: str


class SaveInterviewRequest(BaseModel):
    role: str
    level: str
    feedback: InterviewFeedback
    duration_seconds: Optional[int] = None
    qa_pairs: Optional[List[QuestionAnswer]] = None


class InterviewHistoryItem(BaseModel):
    id: str
    role: str
    level: str
    overall_score: int
    communication_score: int
    technical_score: int
    confidence_score: int
    summary: str
    duration_seconds: Optional[int]
    created_at: datetime


# ── Resume ──
class ATSBreakdown(BaseModel):
    formatting: int
    keywords: int
    quantification: int
    clarity: int


class ResumeAnalysis(BaseModel):
    ats_score: int = Field(..., ge=0, le=100)
    strengths: List[str]
    missing_skills: List[str]
    improvements: List[str]
    suitable_roles: List[str]
    skills_found: List[str]
    summary: str
    ats_breakdown: ATSBreakdown


class ResumeHistoryItem(BaseModel):
    id: str
    filename: Optional[str]
    ats_score: int
    summary: str
    skills_found: List[str]
    suitable_roles: List[str]
    created_at: datetime


# ── Team Matching ──
class TeamProfileRequest(BaseModel):
    skills: List[str] = Field(..., min_length=1)
    interests: Optional[str] = ""
    experience: str = "beginner"
    github: Optional[str] = ""
    stack_preference: Optional[str] = ""


class TeamMatch(BaseModel):
    name: str
    role: str
    skills: List[str]
    interests: str
    compatibility: int
    suggested_role: str
    github: str
    experience: str
    reason: str
    avatar: str


class TeamMatchResponse(BaseModel):
    matches: List[TeamMatch]
    total: int


# ── SkillSwap ──
class SkillSwapPost(BaseModel):
    offer: str = Field(..., min_length=2, max_length=200)
    want: str = Field(..., min_length=2, max_length=200)


class SkillSwapItem(BaseModel):
    id: str
    user_id: Optional[str]
    name: str
    offer: str
    want: str
    experience: str
    avatar: str
    time_ago: str
    connected: bool = False
    created_at: datetime


class SkillSwapListResponse(BaseModel):
    items: List[SkillSwapItem]
    total: int


class ConnectionRequest(BaseModel):
    target_post_id: str


# ── History ──
class HistorySummary(BaseModel):
    interviews: List[InterviewHistoryItem]
    resumes: List[ResumeHistoryItem]
    total_interviews: int
    total_resumes: int
    best_interview_score: Optional[int]
    best_ats_score: Optional[int]
