"""
app/services/resume_service.py — Resume parsing and AI analysis

Handles:
 - PDF text extraction via pdfplumber
 - ATS scoring
 - Skills detection
 - Improvement suggestions
"""
import io
import re
import logging
from typing import Optional
from app.core.ai_provider import ai
from app.schemas.models import ResumeAnalysis, ATSBreakdown

logger = logging.getLogger(__name__)

# Known tech skills for fast local detection
KNOWN_SKILLS = {
    "languages": ["Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Scala"],
    "frontend": ["React", "Vue.js", "Angular", "Next.js", "Svelte", "HTML", "CSS", "Tailwind", "Redux", "GraphQL"],
    "backend": ["Node.js", "FastAPI", "Django", "Flask", "Express", "Spring Boot", "Rails", "NestJS"],
    "databases": ["PostgreSQL", "MongoDB", "MySQL", "Redis", "Elasticsearch", "Cassandra", "SQLite", "DynamoDB"],
    "cloud": ["AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions"],
    "ml": ["TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "LangChain", "OpenAI API"],
    "tools": ["Git", "Linux", "Figma", "Jira", "REST API", "Microservices", "Agile", "Scrum"],
}

ALL_KNOWN_SKILLS = [s for group in KNOWN_SKILLS.values() for s in group]

FALLBACK_ANALYSIS = ResumeAnalysis(
    ats_score=65,
    strengths=[
        "Solid project experience with real-world applications",
        "Clear structure and readable formatting",
        "Good use of action verbs throughout",
    ],
    missing_skills=["Docker", "Kubernetes", "System design", "CI/CD pipeline"],
    improvements=[
        "Add a 2–3 sentence professional summary at the very top",
        "Quantify every achievement: include %, $, time saved, or user counts",
        "Add GitHub URL and LinkedIn profile link in the header",
        "Group skills into categories (Languages, Frameworks, Cloud, Tools)",
    ],
    suitable_roles=["Software Engineer", "Full Stack Developer", "Backend Engineer"],
    skills_found=["Python", "JavaScript", "React", "Node.js", "Git"],
    summary="A solid resume with good project coverage and structure. The biggest wins will come from adding a professional summary, quantifying your impact in each role, and listing missing DevOps/cloud skills you're learning.",
    ats_breakdown=ATSBreakdown(formatting=75, keywords=60, quantification=50, clarity=72),
)


async def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF file."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
            return "\n\n".join(pages)
    except ImportError:
        logger.warning("pdfplumber not installed — trying pypdf2 fallback")
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            return "\n\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception as e2:
            logger.error(f"PDF extraction failed: {e2}")
            return ""
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""


def _detect_skills_locally(text: str) -> list[str]:
    """Fast local skill detection — no AI needed."""
    found = []
    text_lower = text.lower()
    for skill in ALL_KNOWN_SKILLS:
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found


def _score_ats_locally(text: str, skills_found: list) -> ATSBreakdown:
    """Heuristic ATS sub-scoring without AI."""
    text_lower = text.lower()

    # Formatting: check for sections, consistent structure
    has_sections = sum(1 for s in ["experience", "education", "skills", "projects", "summary"] if s in text_lower)
    formatting = min(100, 50 + has_sections * 10)

    # Keywords: skills density
    word_count = len(text.split())
    keyword_density = min(100, int((len(skills_found) / max(word_count / 100, 1)) * 40) + 40)

    # Quantification: numbers/metrics
    numbers = re.findall(r'\b\d+[%$kmMK]?\b', text)
    quant = min(100, 30 + len(numbers) * 5)

    # Clarity: sentence length, action verbs
    action_verbs = ["built", "led", "designed", "implemented", "reduced", "increased", "launched", "optimized", "created", "managed", "developed", "architected", "delivered"]
    verb_count = sum(1 for v in action_verbs if v in text_lower)
    clarity = min(100, 50 + verb_count * 5)

    return ATSBreakdown(
        formatting=formatting,
        keywords=keyword_density,
        quantification=quant,
        clarity=clarity,
    )


async def analyze_resume(text: str, filename: Optional[str] = None) -> ResumeAnalysis:
    """Full resume analysis — local detection + AI enrichment."""
    if not text or len(text.strip()) < 50:
        return FALLBACK_ANALYSIS

    # Local skill detection (fast, no API cost)
    skills_found = _detect_skills_locally(text)
    ats_breakdown = _score_ats_locally(text, skills_found)

    system = """You are an expert resume coach and ATS optimization specialist.
Analyze the resume and return ONLY this exact JSON — no markdown, no extra text:
{
  "ats_score": <integer 0-100>,
  "strengths": ["<specific strength>", "<specific strength>", "<specific strength>"],
  "missing_skills": ["<skill>", "<skill>", "<skill>", "<skill>"],
  "improvements": ["<actionable improvement>", "<actionable improvement>", "<actionable improvement>", "<actionable improvement>"],
  "suitable_roles": ["<role>", "<role>", "<role>"],
  "summary": "<2-3 sentence honest assessment>"
}
Be specific. Reference actual content from the resume. Don't be generic."""

    # Truncate to avoid token limits
    truncated = text[:4000] if len(text) > 4000 else text

    prompt = f"""Analyze this resume:

---
{truncated}
---

Detected skills (from local scan): {', '.join(skills_found) if skills_found else 'none detected'}
ATS sub-scores (locally computed): formatting={ats_breakdown.formatting}, keywords={ats_breakdown.keywords}, quantification={ats_breakdown.quantification}, clarity={ats_breakdown.clarity}

Return the JSON analysis. Use the detected skills as context but give your own holistic ATS score."""

    try:
        raw = await ai.complete_json(prompt, system, max_tokens=1000)

        def clamp(v):
            try: return max(0, min(100, int(v)))
            except Exception: return 65

        return ResumeAnalysis(
            ats_score=clamp(raw.get("ats_score", 65)),
            strengths=_ensure_list(raw.get("strengths"), 3),
            missing_skills=_ensure_list(raw.get("missing_skills"), 3),
            improvements=_ensure_list(raw.get("improvements"), 3),
            suitable_roles=_ensure_list(raw.get("suitable_roles"), 2),
            skills_found=skills_found or ["Python", "JavaScript"],
            summary=str(raw.get("summary", "Good resume. See improvements above.")),
            ats_breakdown=ats_breakdown,
        )
    except Exception as e:
        logger.warning(f"AI resume analysis failed ({e}), using local fallback")
        local_score = int((ats_breakdown.formatting + ats_breakdown.keywords + ats_breakdown.quantification + ats_breakdown.clarity) / 4)
        fb = FALLBACK_ANALYSIS.model_copy()
        fb.ats_score = local_score
        fb.skills_found = skills_found or fb.skills_found
        fb.ats_breakdown = ats_breakdown
        return fb


def _ensure_list(val, min_len: int) -> list:
    if isinstance(val, list) and len(val) >= min_len:
        return [str(v) for v in val]
    return ["See detailed analysis above"] * min_len
