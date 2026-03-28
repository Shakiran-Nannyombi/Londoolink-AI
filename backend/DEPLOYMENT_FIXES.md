# Deployment Data Persistence Fixes

## Issues Fixed

### 1. Environment Configuration Bug (CRITICAL)
**Problem**: The config loader checked if `.env.development` exists and used it even in production, causing the app to use SQLite instead of PostgreSQL.

**Fix**: Updated `backend/app/core/config.py` to prioritize `ENVIRONMENT` env var:
- If `ENVIRONMENT=production`, always use `.env`
- Otherwise, use `.env.development` if it exists
- This ensures production deployments never accidentally use SQLite

### 2. Development Files in Production
**Problem**: `.env.development` and `londoolink.db` could be deployed to production.

**Fixes**:
- Added `.env.development` to `.gitignore`
- Added `londoolink.db`, `londoolink.db-shm`, `londoolink.db-wal` to `.gitignore`
- Added `chroma_db/` and `chroma_db_backup/` to `.gitignore`
- Updated `.vercelignore` to exclude these files

### 3. Missing Database Migrations on Deployment
**Problem**: No automatic migration execution on deployment, causing empty/incomplete schema.

**Fix**: Created `backend/startup.sh` that:
1. Runs `alembic upgrade head` to apply all migrations
2. Starts the FastAPI application
3. Ensures database schema is always up-to-date

### 4. Missing Health Check
**Problem**: No way to verify database connectivity after deployment.

**Fix**: Added `/health` endpoint in `backend/app/main.py` that:
- Tests database connection
- Returns database status
- Shows environment and version info
- Helps diagnose deployment issues

### 5. Deployment Configuration
**Problem**: No proper deployment configuration for Render.

**Fix**: Created `backend/render.yaml` with:
- Proper environment variables
- Database connection from Render PostgreSQL
- Startup command using `startup.sh`
- Health check configuration

### 6. Vercel Configuration
**Problem**: Vercel deployment didn't explicitly set `ENVIRONMENT=production`.

**Fix**: Updated `backend/vercel.json` to include `ENVIRONMENT: production` in env vars.

## What's Already Correct

### ChromaDB Configuration
- Already uses `EphemeralClient` in production (in-memory)
- Uses `PersistentClient` only in development
- This is acceptable since RAG data can be regenerated
- Located in `backend/app/services/rag/vector_store.py`

### Database Configuration
- PostgreSQL (Neon) is properly configured in `.env`
- Connection pooling is configured with `pool_pre_ping` and `pool_recycle`
- Migrations exist and are properly structured

### User Model
- All user fields are properly defined in the database schema
- Includes Auth0 integration fields
- Has proper timestamps and indexes

## Deployment Checklist

### Before Deploying
1. ✅ Ensure `.env.development` is NOT in git
2. ✅ Ensure `londoolink.db` is NOT in git
3. ✅ Verify `ENVIRONMENT=production` is set in deployment platform
4. ✅ Verify `DATABASE_URL` points to PostgreSQL (not SQLite)
5. ✅ Ensure all required environment variables are set

### After Deploying
1. Check `/health` endpoint to verify database connectivity
2. Verify migrations ran successfully in deployment logs
3. Test user registration/login to confirm data persists
4. Redeploy and verify user data is still present

## Environment Variables Required

### Production (Render/Vercel)
```bash
ENVIRONMENT=production
DATABASE_URL=postgresql://...  # Must be PostgreSQL, NOT SQLite
SECRET_KEY=...
ENCRYPTION_KEY=...
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CHROMA_DB_PATH=/opt/render/project/src/chroma_db  # Or any path
# ... other API keys and OAuth configs
```

### Development
```bash
ENVIRONMENT=development
DATABASE_URL=sqlite:///./londoolink.db  # OK for local dev
# ... other configs
```

## Testing Data Persistence

1. Create a test user
2. Trigger a redeployment
3. Verify the user still exists after redeployment
4. Check `/health` endpoint shows "database": "connected"

## Notes

- SQLite is fine for local development but NEVER for production
- PostgreSQL data persists across deployments
- ChromaDB data (RAG embeddings) is ephemeral in production by design
- User data, OAuth tokens, and all critical data is in PostgreSQL
