# Londoolink AI — Your Intelligent Digital Twin

> Built for the **Auth0 AI Agents Hackathon 2026**

Londoolink is a multi-agent AI system that acts on your behalf across Gmail, Google Calendar, and Notion — while keeping your credentials locked in **Auth0 Token Vault**. Your agents never hold raw tokens. You stay in control.

**Live Demo:** https://londoolink-ai.vercel.app  
**Backend API:** https://londoolink-abc635b5fe07.herokuapp.com  
**Try Demo Account:** Click "Try Demo" on the login page

---

## The Core Idea

Most AI assistants are passive — they wait for you to ask. Londoolink is proactive:

1. You connect Google and Notion via Auth0 OAuth
2. Auth0 Token Vault securely stores your access tokens
3. LangGraph agents analyze your emails, calendar, and Notion pages
4. You get a prioritized daily briefing
5. Urgent tasks trigger SMS alerts via Africa's Talking

Your agents act on your behalf. Auth0 ensures they only access what you've permitted.

---

## Architecture

```
Frontend (Next.js 14)
    ↓ Auth0 Universal Login
Backend (FastAPI)
    ↓ Auth0 Token Vault (OAuth token storage)
    ↓ LangGraph Multi-Agent System
        ├── Email Agent (Gmail readonly)
        ├── Calendar Agent (Calendar readonly)
        ├── Notion Agent (read_content)
        └── Priority Agent → SMS Alert (Africa's Talking)
    ↓ Neon PostgreSQL (user data, audit logs)
```

### Auth0 Integration
- **Universal Login** — all auth flows through Auth0 (Google OAuth, email/password, MFA)
- **Token Vault** — Google and Notion OAuth tokens stored in Auth0, never in our DB
- **M2M Client** — backend uses client credentials to retrieve tokens from vault
- **MFA** — delegated entirely to Auth0

### LangGraph Agents
- **Email Agent** — reads Gmail with `gmail.readonly` scope, surfaces urgent messages
- **Calendar Agent** — reads Google Calendar, flags conflicts and upcoming meetings
- **Notion Agent** — reads Notion workspace pages for action items
- **Priority Agent** — synthesizes all agent outputs into a ranked briefing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion, Zustand |
| Backend | FastAPI, SQLAlchemy, Alembic |
| AI | LangGraph, Google Gemini |
| Auth | Auth0 (Universal Login, Token Vault, MFA) |
| Database | Neon PostgreSQL |
| SMS | Africa's Talking |
| Deployment | Vercel (frontend), Heroku (backend) |

---

## Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Auth0 account
- Neon PostgreSQL database

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Fill in AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET,
# AUTH0_M2M_CLIENT_ID, AUTH0_M2M_CLIENT_SECRET, DATABASE_URL, GEMINI_API_KEY

alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd app-frontend
npm install

# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=http://localhost:8000

npm run dev
```

---

## Key API Endpoints

```
POST /api/v1/auth/google/callback   — Exchange Auth0 code for JWT
POST /api/v1/auth/demo-login        — Demo account login
GET  /api/v1/agent/briefing/daily   — Generate daily AI briefing
GET  /api/v1/integrations/status    — Check connected services
POST /api/v1/integrations/google/connect  — Start Google OAuth
POST /api/v1/integrations/notion/connect  — Start Notion OAuth
GET  /api/v1/integrations/google/callback — Handle OAuth callback
GET  /api/v1/integrations/notion/callback — Handle OAuth callback
GET  /api/v1/audit                  — Agent action audit log
```

---

## Auth0 Setup

1. Create a Regular Web Application → note Client ID and Secret
2. Create a Machine-to-Machine Application → authorize for your API
3. Create an API with identifier matching your backend URL
4. Enable Google social connection with your Google OAuth credentials
5. Enable Token Vault on the Google connection (Connected Accounts for Token Vault)
6. Set Allowed Callback URLs: `https://your-frontend.vercel.app/auth/callback`

---

## Environment Variables

**Backend**
```
SECRET_KEY=
ENCRYPTION_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://your-backend.herokuapp.com/api/v1/integrations/google/callback
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE=https://your-backend.herokuapp.com
AUTH0_M2M_CLIENT_ID=
AUTH0_M2M_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
NOTION_REDIRECT_URI=https://your-backend.herokuapp.com/api/v1/integrations/notion/callback
FRONTEND_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app
AT_USERNAME=sandbox
AT_API_KEY=
CHROMA_DB_PATH=/tmp/chroma_db
ENVIRONMENT=production
```

**Frontend**
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.herokuapp.com
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://your-backend.herokuapp.com
```

---

## License

MIT — see LICENSE file.

---

Built with ❤️ using FastAPI, Next.js, LangGraph, and Auth0
