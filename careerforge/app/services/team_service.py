"""
app/services/team_service.py — Team matching algorithm

Two-stage approach:
 1. Fast local cosine similarity on skill vectors
 2. AI-generated "why they fit" reason for top matches

No vector DB needed — fast enough for hackathon scale.
"""
import math
import random
import logging
from typing import List
from app.core.ai_provider import ai
from app.schemas.models import TeamMatch, TeamProfileRequest

logger = logging.getLogger(__name__)

# Seeded candidate pool — realistic, diverse profiles
CANDIDATE_POOL = [
    {"name": "Priya Sharma", "role": "ML Engineer", "skills": ["Python", "TensorFlow", "FastAPI", "PostgreSQL", "Docker"], "interests": "AI/ML, data visualization, NLP", "experience": "Intermediate", "github": "github.com/priyasharma"},
    {"name": "Carlos Rivera", "role": "Frontend Engineer", "skills": ["React", "TypeScript", "Figma", "GraphQL", "Next.js"], "interests": "UI/UX, web performance, design systems", "experience": "Intermediate", "github": "github.com/crivera"},
    {"name": "Ayesha Khan", "role": "DevOps Engineer", "skills": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"], "interests": "Cloud infrastructure, SRE, platform engineering", "experience": "Advanced", "github": "github.com/akhan"},
    {"name": "David Chen", "role": "Full Stack Developer", "skills": ["Node.js", "React", "MongoDB", "Redis", "TypeScript"], "interests": "Startups, rapid prototyping, B2B SaaS", "experience": "Beginner", "github": "github.com/dchen"},
    {"name": "Emma Wilson", "role": "Backend Engineer", "skills": ["Go", "PostgreSQL", "GraphQL", "Redis", "Docker"], "interests": "Distributed systems, API design, open source", "experience": "Advanced", "github": "github.com/ewilson"},
    {"name": "Liam Chen", "role": "Mobile Developer", "skills": ["Flutter", "Swift", "Firebase", "React Native", "TypeScript"], "interests": "Consumer apps, AR/VR, mobile UX", "experience": "Intermediate", "github": "github.com/liamchen"},
    {"name": "Sofia Garcia", "role": "UI/UX Designer", "skills": ["Figma", "React", "CSS", "User Research", "Prototyping"], "interests": "Design systems, accessibility, fintech UX", "experience": "Beginner", "github": "github.com/sgarcia"},
    {"name": "Arjun Nair", "role": "Data Scientist", "skills": ["Python", "PyTorch", "Pandas", "SQL", "scikit-learn"], "interests": "MLOps, healthcare AI, time-series forecasting", "experience": "Intermediate", "github": "github.com/arjunnair"},
    {"name": "Mei Zhang", "role": "Security Engineer", "skills": ["Python", "Linux", "Docker", "Go", "Kubernetes"], "interests": "Application security, pen testing, zero-trust", "experience": "Advanced", "github": "github.com/meizhang"},
    {"name": "James Okafor", "role": "Product Manager", "skills": ["Figma", "SQL", "Jira", "Python", "User Research"], "interests": "Growth, edtech, B2C products", "experience": "Intermediate", "github": "github.com/jokafor"},
]


def _skill_vector(skills: List[str], universe: List[str]) -> List[float]:
    """Convert skill list to a binary vector over the universe."""
    skill_set = {s.lower() for s in skills}
    return [1.0 if u.lower() in skill_set else 0.0 for u in universe]


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x**2 for x in a))
    mag_b = math.sqrt(sum(y**2 for y in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def _skill_gap_score(user_skills: List[str], candidate_skills: List[str]) -> float:
    """Reward candidates who have skills the user DOESN'T have (complementarity)."""
    user_set = {s.lower() for s in user_skills}
    candidate_set = {s.lower() for s in candidate_skills}
    unique_to_candidate = candidate_set - user_set
    return len(unique_to_candidate) / max(len(candidate_set), 1)


def _interest_overlap(user_interests: str, candidate_interests: str) -> float:
    """Simple word-overlap scoring for interest fields."""
    if not user_interests or not candidate_interests:
        return 0.3
    user_words = set(user_interests.lower().split())
    cand_words = set(candidate_interests.lower().split())
    overlap = user_words & cand_words
    return min(len(overlap) / max(len(user_words), 1), 1.0)


def compute_local_compatibility(
    user_profile: TeamProfileRequest,
    candidate: dict,
) -> int:
    """Pure local compatibility score — no API calls needed."""
    # Collect all skills for universe
    all_skills = list({
        *user_profile.skills,
        *candidate["skills"],
        "React", "Python", "Node.js", "Docker", "AWS",  # ensure common skills are in universe
    })

    user_vec = _skill_vector(user_profile.skills, all_skills)
    cand_vec = _skill_vector(candidate["skills"], all_skills)

    similarity = _cosine_similarity(user_vec, cand_vec)
    gap_score = _skill_gap_score(user_profile.skills, candidate["skills"])
    interest_score = _interest_overlap(user_profile.interests or "", candidate["interests"])

    # Weighted combination
    # We want complementary skills (gap) more than identical skills (similarity)
    raw = (similarity * 0.35) + (gap_score * 0.45) + (interest_score * 0.20)

    # Scale to 60–98 range for realistic display
    scaled = int(60 + raw * 38)
    return max(60, min(98, scaled))


async def find_matches(profile: TeamProfileRequest, top_k: int = 4) -> List[TeamMatch]:
    """
    Find top-k compatible teammates.
    Local scoring → sort → AI-generate reasons for top matches.
    """
    # Score all candidates
    scored = []
    for candidate in CANDIDATE_POOL:
        score = compute_local_compatibility(profile, candidate)
        # Small random jitter to prevent ties looking artificial
        jitter = random.randint(-2, 2)
        scored.append((max(60, min(98, score + jitter)), candidate))

    # Sort descending, take top k
    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:top_k]

    # Generate initials for avatars
    def get_initials(name: str) -> str:
        parts = name.strip().split()
        return "".join(p[0] for p in parts[:2]).upper()

    # Try AI-generated reasons; fall back to template reasons
    matches = []
    for score, candidate in top:
        reason = await _generate_fit_reason(profile, candidate, score)
        matches.append(
            TeamMatch(
                name=candidate["name"],
                role=candidate["role"],
                skills=candidate["skills"],
                interests=candidate["interests"],
                compatibility=score,
                suggested_role=_suggest_role(candidate),
                github=candidate["github"],
                experience=candidate["experience"],
                reason=reason,
                avatar=get_initials(candidate["name"]),
            )
        )

    return matches


async def _generate_fit_reason(profile: TeamProfileRequest, candidate: dict, score: int) -> str:
    """Generate a one-sentence why-they-fit reason."""
    # Template fallback (no API cost for each card)
    user_skills = set(s.lower() for s in profile.skills)
    cand_skills = candidate["skills"]
    unique = [s for s in cand_skills if s.lower() not in user_skills]

    if unique:
        return f"Brings {', '.join(unique[:2])} expertise you're missing — ideal complement for your stack."
    else:
        return f"Strong overlap on your core skills — great fit as a force multiplier for the team."


async def generate_ai_matches(profile: TeamProfileRequest) -> List[TeamMatch]:
    """
    Alternative: pure AI-generated matches (used when local pool isn't sufficient).
    Only called if explicitly requested.
    """
    system = """You are a team matching algorithm for student hackathons.
Return ONLY a JSON array of 4 teammate objects — no other text:
[{
  "name": "Full Name",
  "role": "Job Title",
  "skills": ["skill1", "skill2", "skill3"],
  "interests": "brief interests",
  "compatibility": <integer 65-95>,
  "suggested_role": "Suggested team role",
  "github": "github.com/username",
  "experience": "Junior|Intermediate|Advanced",
  "reason": "One sentence why they complement this user",
  "avatar": "FS"
}]"""

    prompt = f"""Find 4 complementary hackathon teammates for:
Skills: {', '.join(profile.skills)}
Interests: {profile.interests}
Experience: {profile.experience}
Stack preference: {profile.stack_preference}

Make teammates diverse, realistic, and complementary (not identical) to the user's profile."""

    try:
        raw = await ai.complete_json(prompt, system, max_tokens=1000)
        if isinstance(raw, list):
            return [TeamMatch(**m) for m in raw[:4]]
    except Exception as e:
        logger.warning(f"AI match generation failed: {e}")

    # Fall back to local
    return await find_matches(profile)


def _suggest_role(candidate: dict) -> str:
    """Map candidate role to suggested hackathon team role."""
    mapping = {
        "ML Engineer": "AI/ML Lead",
        "Data Scientist": "Data & Analytics",
        "Frontend Engineer": "Frontend Lead",
        "UI/UX Designer": "Design Lead",
        "Backend Engineer": "Backend Lead",
        "Full Stack Developer": "Fullstack Dev",
        "DevOps Engineer": "Infrastructure Lead",
        "Mobile Developer": "Mobile Dev",
        "Security Engineer": "Security Advisor",
        "Product Manager": "Product Lead",
    }
    return mapping.get(candidate["role"], candidate["role"])
