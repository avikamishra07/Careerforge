# CareerForge AI — Frontend

React + Vite + Tailwind frontend for CareerForge AI.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variable
cp .env.example .env
# Edit .env: VITE_API_BASE_URL="https://careerforge-7pqw.onrender.com"

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

## Project Structure

```
src/
├── main.jsx                  # App entry + Router
├── index.css                 # Global styles + Tailwind
├── constants/index.js        # Colors, nav items, roles, skills
├── api/axios.js              # Axios instance with JWT interceptor
├── context/AuthContext.jsx   # Auth state + history
├── hooks/useToast.jsx        # Toast hook
├── services/
│   ├── auth.service.js
│   ├── interview.service.js
│   ├── resume.service.js
│   ├── team.service.js
│   └── skillswap.service.js
├── components/
│   ├── ui/index.jsx          # Button, Card, Tag, Avatar, etc.
│   └── layout/
│       ├── AppLayout.jsx     # Shell with sidebar + toast
│       ├── Sidebar.jsx
│       └── ProtectedRoute.jsx
└── pages/
    ├── Landing.jsx
    ├── Login.jsx
    ├── Register.jsx
    ├── Dashboard.jsx
    ├── Interview.jsx         # AI mock interview
    ├── Resume.jsx            # ATS analyzer
    ├── Team.jsx              # Team matching
    ├── SkillSwap.jsx         # Peer skill exchange
    ├── History.jsx
    └── Profile.jsx
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `"https://careerforge-7pqw.onrender.com"` | Backend API URL |

## Backend

Make sure FastAPI backend is running on `"https://careerforge-7pqw.onrender.com"`.
