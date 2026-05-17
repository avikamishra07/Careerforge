# CareerForge AI — Backend

AI-powered career platform: mock interviews, resume analysis, team matching, SkillSwap.

Built with FastAPI + MongoDB + Groq/Gemini/Anthropic.

---

## Quick Start

### 1. Create virtual environment & install dependencies

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in **at least one AI key** (Groq is free and fastest):

- Get a free Groq key at: https://console.groq.com
- Generate a JWT secret: `python -c "import secrets; print(secrets.token_hex(32))"`

MongoDB is **optional** — the app runs in in-memory mode without it.

### 3. Start the server

```bash
uvicorn main:app --reload --port 8000
```

### 4. Open in browser

| URL | Description |
|-----|-------------|
| http://"https://careerforge-7pqw.onrender.com"/docs | Swagger UI — test all endpoints |
| http://"https://careerforge-7pqw.onrender.com"/redoc | ReDoc API reference |
| http://"https://careerforge-7pqw.onrender.com"/api/v1/health | Health check |

---

## Project Structure

```
careerforge/
├── main.py                        # FastAPI app entry point
├── requirements.txt
├── .env.example
└── app/
    ├── core/
    │   ├── config.py              # Settings from .env
    │   ├── database.py            # MongoDB (Motor async)
    │   ├── auth.py                # JWT helpers
    │   └── ai_provider.py        # Groq → Gemini → Anthropic fallback chain
    ├── schemas/
    │   └── models.py              # All Pydantic request/response schemas
    ├── services/
    │   ├── interview_service.py   # Question generation & evaluation
    │   ├── resume_service.py      # PDF extraction & ATS scoring
    │   ├── team_service.py        # Cosine similarity team matching
    │   ├── user_service.py        # Auth & profile management
    │   └── history_service.py     # Save & retrieve history
    └── api/v1/routes/
        ├── health.py
        ├── interview.py
        ├── resume.py
        ├── skillswap.py
        ├── team.py
        └── users.py
```

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/users/register` | No | Register new account |
| POST | `/api/v1/users/login` | No | Login, get JWT |
| GET | `/api/v1/users/me` | Yes | Get profile |
| PATCH | `/api/v1/users/me` | Yes | Update profile |

### Interview
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/interview/questions` | Optional | Generate questions |
| POST | `/api/v1/interview/evaluate` | Optional | Evaluate answers |
| POST | `/api/v1/interview/save` | Required | Save to history |
| GET | `/api/v1/interview/history` | Required | Get history |

### Resume
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/resume/analyze/text` | Optional | Analyze pasted text |
| POST | `/api/v1/resume/analyze/pdf` | Optional | Analyze uploaded PDF |
| POST | `/api/v1/resume/save` | Required | Save to history |

### Team Matching
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/team/match` | Optional | Find teammates |

### SkillSwap
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/skillswap/` | Optional | List posts |
| POST | `/api/v1/skillswap/` | Required | Create post |
| POST | `/api/v1/skillswap/{id}/connect` | Required | Toggle connect |
| DELETE | `/api/v1/skillswap/{id}` | Required | Delete own post |

---

## Quick Test (no MongoDB needed)

```bash
# Health check
curl "https://careerforge-7pqw.onrender.com"

# Generate interview questions
curl -X POST "https://careerforge-7pqw.onrender.com" \
  -H "Content-Type: application/json" \
  -d '{"role": "Backend Engineer", "level": "mid", "count": 5}'

# Team matching
curl -X POST "https://careerforge-7pqw.onrender.com" \
  -H "Content-Type: application/json" \
  -d '{"skills": ["Python", "React"], "interests": "AI startups", "experience": "intermediate"}'
```
