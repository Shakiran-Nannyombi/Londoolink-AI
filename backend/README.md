# Londoolink AI Backend

An intelligent agent backend powered by LangGraph multi-agent orchestration that securely tracks and links your digital life.

## Quick Start

### Prerequisites
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager
- Docker and Docker Compose

### 1. Generate Security Keys

```bash
# Generate SECRET_KEY (copy output to .env)
openssl rand -hex 32

# Generate ENCRYPTION_KEY (copy output to .env)
python -c "import os; print(os.urandom(32).hex())"
```

### 2. Setup Environment

```bash
# Install dependencies
uv sync

# Start PostgreSQL database
docker-compose up -d postgres

# Initialize database tables
uv run python init_db.py
```

### 3. Start Backend Server

```bash
# Start the FastAPI server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**API Available at:**
- **Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Key API Endpoints

**Authentication:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

**LangGraph Multi-Agent System:**
- `GET /api/v1/agent/briefing/daily` - Get AI-powered daily briefing
- `POST /api/v1/agent/analyze/document` - Analyze document with AI

**Data Ingestion:**
- `POST /api/v1/ingest/email` - Ingest email data
- `POST /api/v1/ingest/calendar` - Ingest calendar data
- `POST /api/v1/ingest/generic` - Ingest social media/messages

## Environment Variables

Create a `.env` file with your keys:

```bash
# Security Keys (generate with commands above)
SECRET_KEY="your-generated-secret-key"
ENCRYPTION_KEY="your-generated-encryption-key"

# Database
DATABASE_URL="postgresql+psycopg2://londoolink:londoolink123@localhost:5432/londoolink_db"

# AI Providers
GROQ_API_KEY="your-groq-api-key"
OPENAI_API_KEY="your-openai-api-key"

# JWT Configuration
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Quick Test

```bash
# Register a user
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'

# Login to get token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'

# Get daily briefing (use token from login)
curl -X GET "http://localhost:8000/api/v1/agent/briefing/daily" \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

**Backend is ready!** Visit http://localhost:8000/docs for interactive API documentation.