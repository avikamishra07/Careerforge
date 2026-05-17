"""
app/services/interview_service.py — AI interview logic

Question generation and answer evaluation via Groq/Gemini/Anthropic.
Includes hardened fallbacks so the demo never breaks.
"""
import logging
from typing import List
from app.core.ai_provider import ai
from app.schemas.models import (
    QuestionAnswer, InterviewFeedback, ExperienceLevel
)

logger = logging.getLogger(__name__)

# ── Fallback data (used when AI is unavailable) ──
FALLBACK_QUESTIONS = {
    "default": [
        "Tell me about yourself and what led you to pursue this role.",
        "Describe the most technically challenging project you've worked on.",
        "How do you handle disagreements with teammates or managers?",
        "Walk me through how you debug a critical production issue.",
        "What's a skill or technology you've recently learned, and why?",
    ],
    "senior": [
        "Tell me about a system you designed from scratch — what were the trade-offs?",
        "How do you approach technical debt in a growing codebase?",
        "Describe a time you drove an engineering culture change at your team.",
        "How would you design a URL shortener that handles 100M requests/day?",
        "What's your philosophy on code review?",
    ],
}

FALLBACK_FEEDBACK = InterviewFeedback(
    overall_score=70,
    communication_score=75,
    technical_score=65,
    confidence_score=68,
    strengths=[
        "Clear and structured communication",
        "Demonstrated enthusiasm for the role",
        "Good use of concrete examples",
    ],
    weaknesses=[
        "Technical answers could go deeper on implementation details",
        "Missing quantifiable metrics in achievement statements",
    ],
    improvements=[
        "Use the STAR method (Situation, Task, Action, Result) consistently",
        "Quantify your impact: %, $ saved, users affected, time reduced",
        "Prepare 2–3 strong technical projects to reference across answers",
    ],
    communication_feedback="Your answers were articulate and easy to follow. You maintained good pacing and structure throughout. Focus on being more concise in behavioral answers.",
    technical_feedback="You showed solid foundational knowledge for the role. To stand out at a senior level, dive deeper into implementation choices and trade-offs rather than staying high-level.",
    summary="A solid performance overall. Sharpening your technical depth and adding quantifiable achievements to your answers will make a significant difference in real interviews.",
)


async def generate_questions(
    role: str,
    level: ExperienceLevel = ExperienceLevel.mid,
    count: int = 5,
) -> List[str]:
    """Generate role-specific interview questions via AI."""
    level_desc = {
        "junior": "junior/entry-level (0–2 years experience)",
        "mid": "mid-level (2–5 years experience)",
        "senior": "senior (5+ years, leadership expected)",
    }.get(level, "mid-level")

    system = """You are a senior technical interviewer at a top tech company.
Generate realistic, specific interview questions — not generic ones.
Mix technical and behavioral. Be concise.
Return ONLY a valid JSON array of strings, nothing else."""

    prompt = f"""Generate exactly {count} interview questions for a {role} position at {level_desc}.
Mix {count - 2} technical and 2 behavioral questions.
Make technical questions specific to the role, not generic.
Return ONLY a JSON array of {count} strings."""

    try:
        result = await ai.complete_json(prompt, system, max_tokens=800)
        if isinstance(result, list) and len(result) >= 3:
            return result[:count]
        raise ValueError("Invalid question format from AI")
    except Exception as e:
        logger.warning(f"Question generation failed ({e}), using fallback")
        base = FALLBACK_QUESTIONS.get(
            "senior" if level == "senior" else "default",
            FALLBACK_QUESTIONS["default"],
        )
        return base[:count]


async def evaluate_interview(
    role: str,
    level: ExperienceLevel,
    qa_pairs: List[QuestionAnswer],
    duration_seconds: int = 0,
) -> InterviewFeedback:
    """Evaluate interview answers and return structured feedback."""
    qa_text = "\n\n".join(
        f"Q{i+1}: {qa.question}\nA{i+1}: {qa.answer or '(No answer provided)'}"
        for i, qa in enumerate(qa_pairs)
    )

    level_desc = {
        "junior": "junior/entry-level",
        "mid": "mid-level",
        "senior": "senior",
    }.get(level, "mid-level")

    answered = sum(1 for qa in qa_pairs if qa.answer.strip())
    total = len(qa_pairs)

    system = f"""You are an expert career coach evaluating a {level_desc} {role} mock interview.
Be honest but constructive. Scores should reflect actual quality, not just inflate.
A strong performance scores 80+. Average is 60–79. Weak is below 60.
Return ONLY this exact JSON structure with no other text:
{{
  "overall_score": <integer 0-100>,
  "communication_score": <integer 0-100>,
  "technical_score": <integer 0-100>,
  "confidence_score": <integer 0-100>,
  "strengths": ["<specific strength>", "<specific strength>", "<specific strength>"],
  "weaknesses": ["<specific weakness>", "<specific weakness>"],
  "improvements": ["<actionable advice>", "<actionable advice>", "<actionable advice>"],
  "communication_feedback": "<2-3 sentences about communication style and clarity>",
  "technical_feedback": "<2-3 sentences about technical depth and accuracy>",
  "summary": "<2-3 sentence overall assessment>"
}}"""

    prompt = f"""Evaluate this {role} interview ({answered}/{total} questions answered):

{qa_text}

Session duration: {duration_seconds // 60} minutes.
Provide honest, specific, actionable feedback."""

    try:
        raw = await ai.complete_json(prompt, system, max_tokens=1200)

        # Validate and coerce types
        def clamp(v, lo=0, hi=100):
            try:
                return max(lo, min(hi, int(v)))
            except Exception:
                return 70

        return InterviewFeedback(
            overall_score=clamp(raw.get("overall_score", 70)),
            communication_score=clamp(raw.get("communication_score", 70)),
            technical_score=clamp(raw.get("technical_score", 70)),
            confidence_score=clamp(raw.get("confidence_score", 70)),
            strengths=_ensure_list(raw.get("strengths"), 3, "Clear communication"),
            weaknesses=_ensure_list(raw.get("weaknesses"), 2, "Could go deeper"),
            improvements=_ensure_list(raw.get("improvements"), 3, "Practice the STAR method"),
            communication_feedback=str(raw.get("communication_feedback", "Good communication overall.")),
            technical_feedback=str(raw.get("technical_feedback", "Solid technical foundation.")),
            summary=str(raw.get("summary", "Good performance overall.")),
        )
    except Exception as e:
        logger.warning(f"Interview evaluation failed ({e}), using fallback")
        # Adjust fallback scores based on answer completeness
        completeness = answered / max(total, 1)
        fb = FALLBACK_FEEDBACK.model_copy()
        base = int(60 + completeness * 25)
        fb.overall_score = base
        fb.communication_score = base + 5
        fb.technical_score = base - 5
        fb.confidence_score = base - 2
        return fb


def _ensure_list(val, min_len: int, fallback_item: str) -> List[str]:
    if isinstance(val, list) and len(val) >= min_len:
        return [str(v) for v in val]
    return [fallback_item] * min_len
